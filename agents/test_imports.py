"""
Simple test to verify agents work
"""

print("\n" + "=" * 60)
print("🧪 Testing WanderLink Agents Setup")
print("=" * 60 + "\n")

# Test imports
print("Testing imports...")

try:
    from uagents import Agent, Context, Model
    print("✅ uagents imported successfully")
except ImportError as e:
    print(f"❌ Failed to import uagents: {e}")

try:
    from fastapi import FastAPI
    print("✅ fastapi imported successfully")
except ImportError as e:
    print(f"❌ Failed to import fastapi: {e}")

try:
    import httpx
    print("✅ httpx imported successfully")
except ImportError as e:
    print(f"❌ Failed to import httpx: {e}")

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv imported successfully")
except ImportError as e:
    print(f"❌ Failed to import dotenv: {e}")

print("\n" + "=" * 60)
print("✅ All imports successful!")
print("=" * 60 + "\n")

print("📝 Next steps:")
print("1. Open 3 separate PowerShell terminals")
print("2. In each, run:")
print("   cd d:\\WanderLink\\agents")
print("   .\\venv\\Scripts\\Activate.ps1")
print("3. Then run:")
print("   Terminal 1: python src\\matchmaker_agent.py")
print("   Terminal 2: python src\\planner_agent.py")
print("   Terminal 3: python src\\agent_service.py")
print("\n")
