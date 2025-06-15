#!/bin/bash
# Navigate to the script's directory, even if it's symlinked


# Build new args with absolute path for --dir
new_args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir)
      if [[ -n "$2" ]]; then
        abs_dir=$(realpath "$2")
        new_args+=("--dir" "$abs_dir")
        shift 2
      else
        echo "Error: --dir requires a value"
        exit 1
      fi
      ;;
    *)
      new_args+=("$1")
      shift
      ;;
  esac
done

# Change to the server base directory (for static files)
cd "$(dirname "$(realpath "$0")")"

# Run Python script with modified args
python3 src/py/server.py "${new_args[@]}"
