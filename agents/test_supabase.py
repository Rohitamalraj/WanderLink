"""Test Supabase connection and configuration"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔍 Checking Supabase Configuration...\n")

# Check if environment variables are set
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Not set'}")
print(f"SUPABASE_SERVICE_KEY: {'✅ Set' if supabase_key else '❌ Not set'}")

if supabase_url:
    print(f"URL: {supabase_url}")

if not supabase_url or not supabase_key:
    print("\n❌ Supabase credentials not found!")
    exit(1)

# Try to import and connect
print("\n🔌 Testing Supabase connection...")
try:
    from supabase import create_client, Client
    
    supabase: Client = create_client(supabase_url, supabase_key)
    print("✅ Supabase client created successfully!")
    
    # Test a simple query
    print("\n🧪 Testing database connection...")
    result = supabase.table('users').select("*").limit(1).execute()
    print(f"✅ Database connection successful!")
    print(f"📊 Users table exists and is accessible")
    
except Exception as e:
    print(f"❌ Connection failed: {str(e)}")
    print("\nℹ️  This might be normal if you haven't run the SQL schema yet.")
    print("   Check SUPABASE_SETUP.md for instructions.")
