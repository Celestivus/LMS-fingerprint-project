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

                # Explicit check for get_students_by_section
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
                print(
                    f">>> get_students_by_section handler reached for section: {section}"
                )

                loop = asyncio.get_running_loop()

                def fetch_students(section):
                    try:
                        print(f"  >> Connecting to DB for section {section}")
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()
                        cur.execute(
                            "SELECT student_id, full_name, section_number, email FROM Students WHERE section_number = %s ORDER BY full_name",
                            (section,),
                        )
                        rows = cur.fetchall()
                        print(f"  >> DB returned {len(rows)} rows")
                        students = []
                        for r in rows:
                            students.append(
                                {
                                    "id": r[0],
                                    "name": r[1],
                                    "section": r[2],
                                    "email": r[3],
                                }
                            )
                        return {"success": True, "students": students}
                    except Exception as e:
                        print("  >> DB error fetching students:", e)
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

                result = await loop.run_in_executor(None, fetch_students, section)
                if result.get("success"):
                    resp = {
                        "type": "students_list",
                        "section": section,
                        "students": result.get("students"),
                    }
                    print(
                        f"Sending {len(result.get('students', []))} students for section {section}"
                    )
                else:
                    resp = {
                        "type": "students_list",
                        "section": section,
                        "students": [],
                        "error": result.get("error"),
                    }
                    print(
                        f"Error fetching students for {section}: {result.get('error')}"
                    )

                print("Response:", json.dumps(resp))
                await ws.send(json.dumps(resp))
                continue

            # Handle request for student's own attendance data
            if isinstance(data, dict) and data.get("type") == "get_student_attendance":
                student_id = data.get("student_id")
                section = data.get("section")

                print(
                    f">>> Get student attendance: student_id={student_id}, section={section}"
                )

                loop = asyncio.get_running_loop()

                def fetch_student_attendance(student_id, section):
                    try:
                        print(f"  >> Fetching attendance for student {student_id}")
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
                            SELECT course_name, session_label, attendance 
                            FROM Attendance 
                            WHERE student_id = %s
                            ORDER BY course_name, session_label
                            """,
                            (student_id,),
                        )
                        rows = cur.fetchall()
                        print(
                            f"  >> Found {len(rows)} attendance records for student {student_id}"
                        )

                        attendance_list = []
                        for r in rows:
                            attendance_list.append(
                                {
                                    "course_name": r[0],
                                    "session_label": r[1],
                                    "attendance": r[2],
                                }
                            )
                            print(f"  >> Record: {r[0]} week {r[1]}: attendance={r[2]}")

                        return {"success": True, "attendance": attendance_list}
                    except Exception as e:
                        print(f"  >> DB error fetching student attendance: {e}")
                        return {"success": False, "error": str(e), "attendance": []}
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
                    None, fetch_student_attendance, student_id, section
                )
                resp = {
                    "type": "student_attendance_data",
                    "student_id": student_id,
                    "attendance": result.get("attendance", []),
                }

                await ws.send(json.dumps(resp))
                continue

            # Handle request for attendance by section/course/week (for professor view)
            if isinstance(data, dict) and data.get("type") == "get_attendance_data":
                section = data.get("section")
                course = data.get("course")
                week = data.get("week")
                request_id = data.get("request_id")

                print(
                    f">>> Get attendance data: section={section}, course={course}, week={week}"
                )

                loop = asyncio.get_running_loop()

                def fetch_attendance(section, course, week):
                    try:
                        print(
                            f"  >> Fetching attendance from DB with: section={section}, course={course}, week={week}"
                        )
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
                            SELECT student_id, session_label, course_name, attendance 
                            FROM Attendance 
                            WHERE section_number = %s AND course_name = %s AND session_label = %s
                            ORDER BY student_id
                            """,
                            (section, course, week),
                        )
                        rows = cur.fetchall()
                        print(
                            f"  >> Query executed. Found {len(rows)} attendance records"
                        )
                        print(
                            f"  >> Query params: section_number='{section}', course_name='{course}', session_label='{week}'"
                        )

                        attendance_list = []
                        for r in rows:
                            attendance_list.append(
                                {
                                    "student_id": r[0],
                                    "session_label": r[1],
                                    "course_name": r[2],
                                    "attendance": r[3],
                                }
                            )
                            print(
                                f"  >> Record: student_id={r[0]}, session_label={r[1]}, course_name={r[2]}, attendance={r[3]}"
                            )

                        return {"success": True, "attendance": attendance_list}
                    except Exception as e:
                        print(f"  >> DB error fetching attendance: {e}")
                        return {"success": False, "error": str(e), "attendance": []}
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
                    None, fetch_attendance, section, course, week
                )
                resp = {
                    "type": "attendance_data",
                    "section": section,
                    "course": course,
                    "week": week,
                    "attendance": result.get("attendance", []),
                }
                if request_id is not None:
                    resp["request_id"] = request_id

                await ws.send(json.dumps(resp))
                continue

            if (
                isinstance(data, dict)
                and data.get("type") == "upload_fingerprint_attendance"
            ):
                fingerprints = data.get("fingerprints", [])  # List of {name, base64}
                section = data.get("section")
                week = data.get("week")  # e.g., "5.1", "5.2"
                course = data.get("course")
                request_id = data.get("request_id")

                print(
                    f">>> Fingerprint attendance upload: {len(fingerprints)} files for {section}, week {week}, course {course}"
                )

                loop = asyncio.get_running_loop()

                def process_fingerprint_attendance(section, week, course, fingerprints):
                    try:
                        conn = psycopg2.connect(
                            host=DB_CONFIG["host"],
                            database=DB_CONFIG["dbname"],
                            user=DB_CONFIG["user"],
                            password=DB_CONFIG["password"],
                            port=DB_CONFIG["port"],
                        )
                        cur = conn.cursor()

                        # Fetch all students in section with their fingerprints
                        print(f"  >> Fetching students from section {section}")
                        cur.execute(
                            "SELECT student_id, full_name, fingerprint FROM Students WHERE section_number = %s",
                            (section,),
                        )
                        students = cur.fetchall()
                        print(f"  >> Found {len(students)} students in section")

                        results = []

                        # Process each uploaded fingerprint
                        for fp in fingerprints:
                            filename = fp.get(
                                "name", "unknown"
                            )  # e.g., "student001.bmp"
                            fp_base64 = fp.get("base64", "")

                            # Decode uploaded fingerprint
                            try:
                                match = re.match(
                                    r"data:image/.+;base64,(.*)", fp_base64
                                )
                                if match:
                                    fp_bytes = base64.b64decode(match.group(1))
                                else:
                                    fp_bytes = base64.b64decode(fp_base64)
                            except Exception as e:
                                print(
                                    f"  >> Error decoding fingerprint {filename}: {e}"
                                )
                                results.append(
                                    {
                                        "filename": filename,
                                        "matched": False,
                                        "error": str(e),
                                    }
                                )
                                continue

                            # Compare against each student's fingerprint
                            matched_student = None
                            for student_id, full_name, db_fp_bytes in students:
                                if db_fp_bytes is None:
                                    continue

                                if compare_fingerprints(
                                    fp_bytes, db_fp_bytes, threshold=0.99
                                ):
                                    matched_student = (student_id, full_name)
                                    print(
                                        f"  >> Matched {filename} to {student_id} ({full_name})"
                                    )
                                    break

                            if matched_student:
                                student_id, full_name = matched_student
                                # Record attendance: 1 = present
                                print(
                                    f"  >> Inserting attendance: student_id={student_id}, section={section}, week={week}, course={course}, attendance=1"
                                )
                                cur.execute(
                                    """
                                    INSERT INTO Attendance (student_id, section_number, session_label, course_name, attendance)
                                    VALUES (%s, %s, %s, %s, 1)
                                    ON CONFLICT (student_id, section_number, session_label, course_name) 
                                    DO UPDATE SET attendance = 1
                                    """,
                                    (student_id, section, week, course),
                                )
                                results.append(
                                    {
                                        "filename": filename,
                                        "matched": True,
                                        "student_id": student_id,
                                        "name": full_name,
                                    }
                                )
                            else:
                                print(f"  >> No match found for {filename}")
                                results.append({"filename": filename, "matched": False})

                        # Record absences (0) for students NOT in matched list
                        matched_ids = [
                            r["student_id"] for r in results if r.get("matched")
                        ]
                        if matched_ids:
                            placeholders = ",".join(["%s"] * len(matched_ids))
                            cur.execute(
                                f"""
                                INSERT INTO Attendance (student_id, section_number, session_label, course_name, attendance)
                                SELECT student_id, %s, %s, %s, 0
                                FROM Students
                                WHERE section_number = %s AND student_id NOT IN ({placeholders})
                                ON CONFLICT (student_id, section_number, session_label, course_name)
                                DO UPDATE SET attendance = 0
                                """,
                                [section, week, course, section] + matched_ids,
                            )
                        else:
                            # No matched students: mark all students in the section as absent (0)
                            cur.execute(
                                """
                                INSERT INTO Attendance (student_id, section_number, session_label, course_name, attendance)
                                SELECT student_id, %s, %s, %s, 0
                                FROM Students
                                WHERE section_number = %s
                                ON CONFLICT (student_id, section_number, session_label, course_name)
                                DO UPDATE SET attendance = 0
                                """,
                                (section, week, course, section),
                            )

                        conn.commit()
                        print(
                            f"  >> Attendance recorded for {len(matched_ids)} present, {len(students) - len(matched_ids)} absent"
                        )
                        return {
                            "success": True,
                            "results": results,
                            "matched_count": len(matched_ids),
                            "total_students": len(students),
                        }
                    except Exception as e:
                        print(f"  >> Error processing fingerprint attendance: {e}")
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
                    process_fingerprint_attendance,
                    section,
                    week,
                    course,
                    fingerprints,
                )
                resp = {
                    "type": "fingerprint_attendance_response",
                    "success": result.get("success"),
                    "matched_count": result.get("matched_count", 0),
                    "total_students": result.get("total_students", 0),
                    "results": (
                        result.get("results", []) if result.get("success") else []
                    ),
                }
                if request_id is not None:
                    resp["request_id"] = request_id
                if not result.get("success"):
                    resp["error"] = result.get("error")

                await ws.send(json.dumps(resp))
                continue

    except Exception as e:
        print("Error:", e)

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
