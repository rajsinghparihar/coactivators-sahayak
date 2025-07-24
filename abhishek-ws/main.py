#!/usr/bin/env python3
"""
Main Runner Script for Fun Activity and Planning Agents

This script provides an easy way to run the example agents with session state.
You can run either the fun_activity agent or the planning agent, or both.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def check_dependencies():
    """Check if required dependencies are installed."""
    required_packages = ['google.adk']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Please install dependencies:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required dependencies are installed!")
    return True

async def run_fun_activity_example():
    """Run the fun activity example."""
    print("\n🎯 Running Fun Activity Example...")
    print("=" * 50)
    
    try:
        from example_fun_activity_with_state import run_fun_activity_with_state
        session = await run_fun_activity_with_state()
        print("\n✅ Fun Activity example completed successfully!")
        return session
    except Exception as e:
        print(f"\n❌ Error running fun activity example: {e}")
        return None

async def run_planning_example():
    """Run the planning example."""
    print("\n📋 Running Lesson Planning Example...")
    print("=" * 50)
    
    try:
        from example_planning_with_state import run_planning_with_state
        session = await run_planning_with_state()
        print("\n✅ Planning example completed successfully!")
        return session
    except Exception as e:
        print(f"\n❌ Error running planning example: {e}")
        return None

async def run_both_examples():
    """Run both examples sequentially."""
    print("\n🚀 Running Both Examples...")
    print("=" * 50)
    
    # Run fun activity first
    fun_session = await run_fun_activity_example()
    
    print("\n" + "="*50)
    
    # Run planning second
    planning_session = await run_planning_example()
    
    return fun_session, planning_session

def main():
    """Main function to handle user input and run examples."""
    print("🎓 Educational Agents with Session State")
    print("=" * 50)
    
    # Check dependencies first
    if not check_dependencies():
        return
    
    print("\n📚 Available Examples:")
    print("1. Fun Activity Agent (generates educational activities)")
    print("2. Lesson Planning Agent (creates weekly lesson plans)")
    print("3. Run Both Examples")
    print("4. Exit")
    
    while True:
        try:
            choice = input("\n🎯 Choose an option (1-4): ").strip()
            
            if choice == "1":
                asyncio.run(run_fun_activity_example())
                break
            elif choice == "2":
                asyncio.run(run_planning_example())
                break
            elif choice == "3":
                asyncio.run(run_both_examples())
                break
            elif choice == "4":
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            break

if __name__ == "__main__":
    main() 