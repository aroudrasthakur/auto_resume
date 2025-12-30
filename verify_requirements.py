#!/usr/bin/env python3
"""
Verify that all requirements are compatible with Python 3.11.
This script checks for common dependency conflicts.
"""

import sys
import subprocess
from packaging import version

def check_python_version():
    """Check Python version is 3.11+."""
    if sys.version_info < (3, 11):
        print(f"[X] Python 3.11+ required, found {sys.version_info.major}.{sys.version_info.minor}")
        return False
    print(f"[OK] Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def verify_requirements():
    """Verify requirements.txt can be resolved."""
    print("\nVerifying requirements compatibility...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "--dry-run", "-r", "requirements.txt"],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("[OK] All requirements are compatible!")
            return True
        else:
            print("[X] Dependency conflicts found:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"[X] Error verifying requirements: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("AI Resume Creator - Requirements Compatibility Check")
    print("=" * 60)
    
    if not check_python_version():
        sys.exit(1)
    
    if not verify_requirements():
        sys.exit(1)
    
    print("\n[OK] All checks passed! Requirements are compatible.")
    print("\nNext step: pip install -r requirements.txt")

