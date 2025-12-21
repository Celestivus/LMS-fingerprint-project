import asyncio
import websockets
import re
import base64
import json
import psycopg2
import io
from PIL import Image
import numpy as np
from datetime import datetime

# DB config (matches usb scripts)
DB_CONFIG = {
    "host": "localhost",
    "dbname": "postgres",
    "user": "postgres",
    "password": "postgres",
    "port": 5432,
}


async def save_fingerpint_image(encoded_str: str):
    match = re.match(r"data:image/(png|jpeg|jpg|bmp);base64,(.*)", encoded_str)
    if match:
        image_format = match.group(1)
        image_data = match.group(2)
    else:
        image_data = encoded_str

    image_bytes = base64.b64decode(image_data)
    print(image_bytes)

    with open(f"test.{image_format}", "wb") as f:
        f.write(image_bytes)


def compare_fingerprints(
    uploaded_bytes: bytes, db_bytes: bytes, threshold: float = 0.85
) -> bool:

    try:
        # Load images from bytes
        uploaded_img = Image.open(io.BytesIO(uploaded_bytes)).convert("L")
        db_img = Image.open(io.BytesIO(db_bytes)).convert("L")

        # Resize to same dimensions for comparison
        target_size = (128, 128)
        uploaded_img = uploaded_img.resize(target_size)
        db_img = db_img.resize(target_size)

        # Convert to numpy arrays
        uploaded_arr = np.array(uploaded_img, dtype=np.float32)
        db_arr = np.array(db_img, dtype=np.float32)

        # Calculate Mean Squared Error (MSE) and convert to similarity score
        mse = np.mean((uploaded_arr - db_arr) ** 2)
        max_pixel_value = 255.0
        similarity = 1 - (mse / (max_pixel_value**2))

        print(f"  >> Fingerprint similarity: {similarity:.2%}")
        return similarity >= threshold
    except Exception as e:
        print(f"  >> Error comparing fingerprints: {e}")
        return False


connected = set()


async def handler(ws):
    connected.add(ws)

    ip, port = ws.remote_address
    print(f"Client connected: {ip}:{port}")

    try:
        async for msg in ws:
            print("Received:", msg)

            try:
                data = json.loads(msg)
                msg_type = data.get("type") if isinstance(data, dict) else "unknown"
                print(f"Message type: {msg_type}")

                if msg_type == "get_students_by_section":
                    print(">>> MATCHED get_students_by_section!")

            except Exception as e:
                print(f"ERROR parsing/checking message: {e}")
                continue

            # Handle login messages
            if isinstance(data, dict) and data.get("type") == "login":
                user_id = data.get("id")
                password = data.get("password")

                loop = asyncio.get_running_loop()

                def verify_user(uid, pwd):
                    try:
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        # Check Students
                        cur.execute(
                            "SELECT student_id, full_name, section_number, password FROM Students WHERE student_id = %s",
                            (uid,),
                        )
                        row = cur.fetchone()
                        if row and str(row[3]) == str(pwd):
                            return {
                                "id": row[0],
                                "name": row[1],
                                "role": "student",
                                "section": row[2],
                            }

                        # Check Professors
                        cur.execute(
                            "SELECT professor_id, full_name, password FROM Professors WHERE professor_id = %s",
                            (uid,),
                        )
                        row = cur.fetchone()
                        if row and str(row[2]) == str(pwd):
                            return {"id": row[0], "name": row[1], "role": "professor"}

                        return None
                    except Exception as e:
                        print("DB error during login:", e)
                        return None
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                user = await loop.run_in_executor(None, verify_user, user_id, password)

                if user:
                    resp = {"type": "login_response", "success": True, "user": user}
                else:
                    resp = {
                        "type": "login_response",
                        "success": False,
                        "error": "Invalid credentials",
                    }

                await ws.send(json.dumps(resp))
                continue

            # Handle registration messages
            if isinstance(data, dict) and data.get("type") == "register":
                role = data.get("role")
                payload = data.get("data") or {}

                loop = asyncio.get_running_loop()

                def register_user(role, payload):
                    try:
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        # Prepare common fields
                        full_name = payload.get("fullName")
                        uid = payload.get("userId")
                        email = payload.get("email")
                        phone = payload.get("phone")
                        password = payload.get("password")
                        fingerprint_b64 = payload.get("fingerprint")

                        fingerprint_bytes = None
                        if fingerprint_b64:
                            m = re.match(r"data:image/.+;base64,(.*)", fingerprint_b64)
                            if m:
                                fingerprint_bytes = base64.b64decode(m.group(1))
                            else:
                                try:
                                    fingerprint_bytes = base64.b64decode(
                                        fingerprint_b64
                                    )
                                except:
                                    fingerprint_bytes = None

                        if role == "STUDENT" or str(role).lower() == "student":
                            level = payload.get("levelDesign")
                            branch = payload.get("branchDept")
                            dob = payload.get("dobAddress")
                            section = payload.get("sectionOffice")

                            # check duplicate
                            cur.execute(
                                "SELECT 1 FROM Students WHERE student_id = %s", (uid,)
                            )
                            if cur.fetchone():
                                return {
                                    "success": False,
                                    "error": "Student ID already exists",
                                }

                            query = """
                                INSERT INTO Students (student_id, full_name, level, branch, date_of_birth, section_number, email, telephone_number, fingerprint, password)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """
                            cur.execute(
                                query,
                                (
                                    uid,
                                    full_name,
                                    level,
                                    branch,
                                    dob,
                                    section,
                                    email,
                                    phone,
                                    (
                                        psycopg2.Binary(fingerprint_bytes)
                                        if fingerprint_bytes is not None
                                        else None
                                    ),
                                    password,
                                ),
                            )
                            conn.commit()
                            return {"success": True}

                        elif role == "PROFESSOR" or str(role).lower() == "professor":
                            design = payload.get("levelDesign")
                            department = payload.get("branchDept")
                            address = payload.get("dobAddress")
                            office = payload.get("sectionOffice")

                            cur.execute(
                                "SELECT 1 FROM Professors WHERE professor_id = %s",
                                (uid,),
                            )
                            if cur.fetchone():
                                return {
                                    "success": False,
                                    "error": "Professor ID already exists",
                                }

                            query = """
                                INSERT INTO Professors (professor_id, full_name, design, department, address, office_location, email, telephone_number, password)
                                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """
                            cur.execute(
                                query,
                                (
                                    uid,
                                    full_name,
                                    design,
                                    department,
                                    address,
                                    office,
                                    email,
                                    phone,
                                    password,
                                ),
                            )
                            conn.commit()
                            return {"success": True}

                        else:
                            return {"success": False, "error": "Unknown role"}
                    except Exception as e:
                        print("DB error during register:", e)
                        return {"success": False, "error": str(e)}
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                result = await loop.run_in_executor(None, register_user, role, payload)
                if result.get("success"):
                    resp = {"type": "register_response", "success": True}
                else:
                    resp = {
                        "type": "register_response",
                        "success": False,
                        "error": result.get("error"),
                    }

                await ws.send(json.dumps(resp))
                continue
            # Handle request for students by section
            if isinstance(data, dict) and data.get("type") == "get_students_by_section":
                section = data.get("section")
                print(f">>> get_students_by_section handler reached for section: {section}")

                loop = asyncio.get_running_loop()

                def fetch_students(section):
                    try:
                        print(f"  >> Querying students for section {section}")
                        conn = psycopg2.connect(**DB_CONFIG)
                        cur = conn.cursor()
                        cur.execute("""
                            SELECT student_id AS id, full_name AS name, section_number AS section, email
                            FROM Students
                            WHERE section_number = %s
                            ORDER BY student_id
                        """, (section,))
                        rows = cur.fetchall()
                        students = [
                            {
                                'id': row[0],
                                'name': row[1],
                                'section': row[2],
                                'email': row[3] or '—'
                            } for row in rows
                        ]
                        print(f"  >> Found {len(students)} students")
                        return {
                            'type': 'students_list',
                            'students': students
                        }
                    except Exception as e:
                        print(f"  >> DB error fetching students: {e}")
                        return {'type': 'error', 'message': str(e)}
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                response = await loop.run_in_executor(None, fetch_students, section)
                await ws.send(json.dumps(response))
                continue

                # Sysadmin DB page
                if isinstance(data, dict) and data.get("type") == "get_table_data":
                    table = data.get("table")
                    print(f">>> SysAdmin requested table: {table}")

                    ALLOWED_TABLES = {
                        "students": """
                                        SELECT student_id, full_name, level, branch, date_of_birth, 
                                               section_number, email, telephone_number
                                        FROM Students
                                        ORDER BY student_id
                                    """,
                        "professors": """
                                        SELECT professor_id, full_name, design, department, 
                                               address, office_location, email, telephone_number
                                        FROM Professors
                                        ORDER BY professor_id
                                    """,
                        "attendance": """
                                        SELECT id, student_id, section_number, course_name, 
                                               session_label, attendance, created_at
                                        FROM Attendance
                                        ORDER BY created_at DESC
                                        LIMIT 1000
                                    """
                    }

                    if table not in ALLOWED_TABLES:
                        await ws.send(json.dumps({
                            "type": "table_data",
                            "success": False,
                            "error": "Invalid table requested"
                        }))
                        print("  >> Invalid table")
                        continue

                    loop = asyncio.get_running_loop()

                    def fetch_table():
                        try:
                            conn = psycopg2.connect(**DB_CONFIG)
                            cur = conn.cursor()
                            cur.execute(ALLOWED_TABLES[table])
                            columns = [desc[0] for desc in cur.description]
                            rows = cur.fetchall()
                            data_rows = [dict(zip(columns, row)) for row in rows]
                            print(f"  >> SUCCESS: Fetched {len(data_rows)} rows from {table}")
                            return {"success": True, "rows": data_rows}
                        except Exception as e:
                            print(f"  >> ERROR fetching {table}: {e}")
                            return {"success": False, "error": str(e)}
                        finally:
                            try:
                                cur.close()
                            except:
                                pass
                            try:
                                conn.close()
                            except:
                                pass

                    result = await loop.run_in_executor(None, fetch_table)

                    await ws.send(json.dumps({
                        "type": "table_data",
                        "success": result["success"],
                        "rows": result.get("rows", []),
                        "error": result.get("error")
                    }))
                    continue

            # Professor list
            if isinstance(data, dict) and data.get("type") == "get_professors_by_department":
                department = data.get("department")
                print(
                    f">>> get_professors_by_department handler reached for department: {department}"
                )

                loop = asyncio.get_running_loop()

                def fetch_professors(department):
                    try:
                        print(f"  >> Connecting to DB for department {department}")
                        conn = psycopg2.connect(**DB_CONFIG)
                        cur = conn.cursor()
                        cur.execute("""
                            SELECT professor_id AS id, full_name AS name, email
                            FROM Professors
                            WHERE department = %s
                        """, (department,))
                        professors = cur.fetchall()
                        return {
                            'type': 'professors_list',
                            'professors': [{'id': row[0], 'name': row[1], 'email': row[2], 'department': department} for row in professors]
                        }
                    except Exception as e:
                        print(f"Error: {e}")
                        return {'type': 'error', 'message': str(e)}
                    finally:
                        cur.close()
                        conn.close()

                response = await loop.run_in_executor(None, fetch_professors, department)
                await ws.send(json.dumps(response))
                continue

            # Handle medical certification upload from student
            if (
                isinstance(data, dict)
                and data.get("type") == "upload_medical_certification"
            ):
                student_id = data.get("student_id")
                course_name = data.get("course_name")
                session_label = data.get("session_label")
                file_name = data.get("file_name")
                file_base64 = data.get("file_data")

                print(
                    f">>> Medical certification upload: student={student_id}, course={course_name}, week={session_label}, file={file_name}"
                )

                loop = asyncio.get_running_loop()

                def save_medical_certification(
                    student_id, course_name, session_label, file_name, file_base64
                ):
                    try:
                        # Decode file
                        match = re.match(r"data:.+;base64,(.*)", file_base64)
                        if match:
                            file_bytes = base64.b64decode(match.group(1))
                        else:
                            file_bytes = base64.b64decode(file_base64)

                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        cur.execute(
                            """
                            INSERT INTO MedicalCertifications 
                            (student_id, course_name, session_label, certification_file, file_name, status)
                            VALUES (%s, %s, %s, %s, %s, 'pending')
                            ON CONFLICT (student_id, course_name, session_label)
                            DO UPDATE SET certification_file = EXCLUDED.certification_file, 
                                          file_name = EXCLUDED.file_name,
                                          uploaded_at = CURRENT_TIMESTAMP,
                                          status = 'pending'
                            """,
                            (
                                student_id,
                                course_name,
                                session_label,
                                psycopg2.Binary(file_bytes),
                                file_name,
                            ),
                        )
                        conn.commit()
                        print(f"  >> Medical certification saved for {student_id}")
                        return {
                            "success": True,
                            "message": "Certification uploaded successfully",
                        }
                    except Exception as e:
                        print(f"  >> Error saving medical certification: {e}")
                        return {"success": False, "error": str(e)}
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                result = await loop.run_in_executor(
                    None,
                    save_medical_certification,
                    student_id,
                    course_name,
                    session_label,
                    file_name,
                    file_base64,
                )
                resp = {
                    "type": "medical_certification_response",
                    "success": result.get("success"),
                    "message": result.get("message") or result.get("error"),
                }
                await ws.send(json.dumps(resp))
                continue

            # Handle professor viewing pending certifications
            if (
                isinstance(data, dict)
                and data.get("type") == "get_pending_certifications"
            ):
                print(">>> Get pending medical certifications request")

                loop = asyncio.get_running_loop()

                def fetch_pending_certifications():
                    try:
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        cur.execute(
                            """
                            SELECT id, student_id, course_name, session_label, file_name, uploaded_at, status
                            FROM MedicalCertifications
                            WHERE status = 'pending'
                            ORDER BY uploaded_at DESC
                            """
                        )
                        rows = cur.fetchall()
                        print(f"  >> Found {len(rows)} pending certifications")

                        certifications = []
                        for r in rows:
                            certifications.append(
                                {
                                    "id": r[0],
                                    "student_id": r[1],
                                    "course_name": r[2],
                                    "session_label": r[3],
                                    "file_name": r[4],
                                    "uploaded_at": r[5].isoformat() if r[5] else None,
                                    "status": r[6],
                                }
                            )

                        return {"success": True, "certifications": certifications}
                    except Exception as e:
                        print(f"  >> DB error fetching certifications: {e}")
                        return {"success": False, "error": str(e), "certifications": []}
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                result = await loop.run_in_executor(None, fetch_pending_certifications)
                resp = {
                    "type": "pending_certifications_list",
                    "certifications": result.get("certifications", []),
                }
                await ws.send(json.dumps(resp))
                continue

            # Handle professor approving medical certification
            if isinstance(data, dict) and data.get("type") == "approve_certification":
                certification_id = data.get("certification_id")
                professor_id = data.get("professor_id")
                notes = data.get("notes", "")

                print(
                    f">>> Approve certification: id={certification_id}, professor={professor_id}"
                )

                loop = asyncio.get_running_loop()

                def approve_certification(certification_id, professor_id, notes):
                    try:
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        # Get certification details
                        cur.execute(
                            "SELECT student_id, course_name, session_label FROM MedicalCertifications WHERE id = %s",
                            (certification_id,),
                        )
                        cert_row = cur.fetchone()
                        if not cert_row:
                            return {
                                "success": False,
                                "error": "Certification not found",
                            }

                        student_id, course_name, session_label = cert_row

                        # Update certification status
                        cur.execute(
                            """
                            UPDATE MedicalCertifications
                            SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = %s, professor_notes = %s
                            WHERE id = %s
                            """,
                            (professor_id, notes, certification_id),
                        )

                        # Update attendance to 1 (present) for that week
                        cur.execute(
                            """
                            SELECT section_number FROM Students WHERE student_id = %s
                            """,
                            (student_id,),
                        )
                        section_row = cur.fetchone()
                        if section_row:
                            section_number = section_row[0]
                            cur.execute(
                                """
                                UPDATE Attendance
                                SET attendance = 1
                                WHERE student_id = %s AND course_name = %s AND session_label = %s
                                """,
                                (student_id, course_name, session_label),
                            )
                            print(
                                f"  >> Attendance updated to 1 for {student_id} {course_name} {session_label}"
                            )

                        conn.commit()
                        print(f"  >> Certification {certification_id} approved")
                        return {
                            "success": True,
                            "message": "Certification approved and attendance updated",
                        }
                    except Exception as e:
                        print(f"  >> Error approving certification: {e}")
                        return {"success": False, "error": str(e)}
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                result = await loop.run_in_executor(
                    None, approve_certification, certification_id, professor_id, notes
                )
                resp = {
                    "type": "certification_approval_response",
                    "success": result.get("success"),
                    "message": result.get("message") or result.get("error"),
                }
                await ws.send(json.dumps(resp))
                continue

            # Handle professor rejecting medical certification
            if isinstance(data, dict) and data.get("type") == "reject_certification":
                certification_id = data.get("certification_id")
                professor_id = data.get("professor_id")
                notes = data.get("notes", "")

                print(
                    f">>> Reject certification: id={certification_id}, professor={professor_id}"
                )

                loop = asyncio.get_running_loop()

                def reject_certification(certification_id, professor_id, notes):
                    try:
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        cur.execute(
                            """
                            UPDATE MedicalCertifications
                            SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = %s, professor_notes = %s
                            WHERE id = %s
                            """,
                            (professor_id, notes, certification_id),
                        )
                        conn.commit()
                        print(f"  >> Certification {certification_id} rejected")
                        return {"success": True, "message": "Certification rejected"}
                    except Exception as e:
                        print(f"  >> Error rejecting certification: {e}")
                        return {"success": False, "error": str(e)}
                    finally:
                        try:
                            cur.close()
                        except:
                            pass
                        try:
                            conn.close()
                        except:
                            pass

                result = await loop.run_in_executor(
                    None, reject_certification, certification_id, professor_id, notes
                )
                resp = {
                    "type": "certification_rejection_response",
                    "success": result.get("success"),
                    "message": result.get("message") or result.get("error"),
                }
                await ws.send(json.dumps(resp))
                continue

    finally:
        connected.remove(ws)


async def main():
    # Increase max_size to allow larger payloads (e.g., multiple BMP files encoded in base64).
    # Default max_size is 1MB which causes "message too big" (1009) errors when sending large images.
    # Set to 50MB here; set to None to disable limit entirely if desired.
    max_size_bytes = 50 * 1024 * 1024
    async with websockets.serve(
        handler, "0.0.0.0", 8000, max_size=max_size_bytes, max_queue=32
    ):
        print(f"Server started on LAN (max_size={max_size_bytes} bytes)")
        await asyncio.Future()


asyncio.run(main())