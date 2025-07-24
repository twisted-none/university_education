import os

def print_tree(start_path, prefix=""):
    items = sorted(os.listdir(start_path))
    for index, name in enumerate(items):
        path = os.path.join(start_path, name)
        is_last = index == len(items) - 1
        connector = "└── " if is_last else "├── "
        print(prefix + connector + name)
        if os.path.isdir(path):
            extension = "    " if is_last else "│   "
            print_tree(path, prefix + extension)

if __name__ == "__main__":
    print("📁 Project Tree")
    print_tree(".")
