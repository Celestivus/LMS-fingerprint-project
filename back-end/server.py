import asyncio
import websockets
import re
import base64
import json
import psycopg2

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


connected = set()


async def handler(ws):
    connected.add(ws)

    ip, port = ws.remote_address
    print(f"Client connected: {ip}:{port}")

    try:
        async for msg in ws:
            print("Received:", msg)

            data = json.loads(msg)

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
            if "data" in data and "fingerprint" in data["data"]:
                await save_fingerpint_image(data["data"]["fingerprint"])

            if "file" in data:
                for c in connected:
                    # if c != ws:
                    await c.send(data["file"])

    except Exception as e:
        print("Error:", e)

    finally:
        connected.remove(ws)


async def main():
    async with websockets.serve(handler, "0.0.0.0", 8000):
        print("Server started on LAN")
        await asyncio.Future()


asyncio.run(main())