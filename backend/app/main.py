from fastapi import FastAPI, Depends, HTTPException, Header, Request
from supabase import create_client, Client
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

# load_dotenv()

# app = FastAPI()

# supabase: Client = create_client(
#     os.getenv("SUPABASE_URL"),
#     os.getenv("SUPABASE_ANON_KEY")
# )

# async def get_current_user(authorization: str = Header(...)):
#     try:
#         token = authorization.split(" ")[1]
#         payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"], options={"verify_aud": False})
#         print("Decoded token:", payload) # debug
#         user_id = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid authentication token")
#         return user_id
#     except JWTError as e:
#         print("JWT Error", e) # debug
#         raise HTTPException(status_code=401, detail="Invalid authentication token")
#     except Exception as e:
#         print("General Error in get_current_user", e)
#         raise HTTPException(status_code=401, detail="Invalid authentication header format")

# # GET user's problem attempts
# @app.get("/my-attempts")
# async def get_leetcode_attempts(authorization: str = Header(...), user_id: str = Depends(get_current_user)):
#     try:
#         # No need to create a new client or set session; already authenticated via token
#         response = supabase.table("mock_interviews").select("*").eq("user_id", user_id).execute()
#         print("Full response:", response)
#         print("Response data type:", type(response.data))
#         print("Response data contents:", response.data)
#         return response.data
#     except Exception as e:
#         import traceback
#         print("Error fetching user attempts:", e)
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Failed to fetch user attempts: {str(e)}")

# @app.get("/check-secret")
# async def check_secret():
#     return {
#         "jwt_secret_in_use": f"{os.getenv('JWT_SECRET')[:5]}...",  # First 5 chars
#         "expected_secret_from": "Supabase Dashboard → API → JWT Secret"
#     }

# @app.get("/test-table")
# async def test_table():
#     try:
#         response = supabase.table("mock_interviews").select("*").limit(1).execute()
#         return response.data
#     except Exception as e:
#         print("Error testing table access:", e)
#         raise HTTPException(status_code=500, detail="Could not fetch data from Supabase")
