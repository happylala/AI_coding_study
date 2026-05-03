---
name: generate-from-pattern
description: Generate a new project directory structure based on the xac_pattern template. Use this skill when the user wants to create a new project following the xac_pattern structure, scaffold configuration files, or set up a new environment with the standard YAML configuration layout. Trigger when users mention "generate from pattern", "create xac structure", "new project from template", or reference xac_pattern.
---

# Generate From Pattern

This skill helps you create a new project directory that mirrors the xac_pattern structure. The generated project will have the same directory hierarchy and YAML files, but all YAML files will be empty (ready for the user to fill in).

## When to Use This Skill

Use this skill when the user wants to:
- Create a new project based on xac_pattern
- Generate a configuration structure matching xac_pattern
- Scaffold a new environment with standard YAML files
- Set up a project directory following the xac_pattern template

## The xac_pattern Structure

The source pattern is located at: `F:\AI_Project\claude_code_prj\xac_pattern`

It contains:
```
xac_pattern/
├── blueprints/
│   └── input_metadata.yaml
├── specs/
│   ├── PRO/
│   │   └── input.yaml
│   └── UAT/
│       └── input.yaml
├── templates/
│   ├── input.yaml
│   └── main.yaml
└── manifest.yaml
```

## How to Generate

### Step 1: Confirm the Target Directory

Ask the user where they want to create the new project. They should provide an absolute path like:
- `F:\AI_Project\my_new_project`
- `C:\Projects\config_setup`

### Step 2: Create the Directory Structure

Create all directories first:
```bash
mkdir -p "<target_path>/blueprints"
mkdir -p "<target_path>/specs/PRO"
mkdir -p "<target_path>/specs/UAT"
mkdir -p "<target_path>/templates"
```

### Step 3: Create Empty YAML Files

Create all 6 YAML files with empty content:

```bash
touch "<target_path>/manifest.yaml"
touch "<target_path>/blueprints/input_metadata.yaml"
touch "<target_path>/specs/PRO/input.yaml"
touch "<target_path>/specs/UAT/input.yaml"
touch "<target_path>/templates/input.yaml"
touch "<target_path>/templates/main.yaml"
```

### Step 4: Verify and Report

After creation, verify the structure was created correctly:
```bash
tree "<target_path>" -L 3
```

Then report to the user:
- The location of the new project
- The complete directory structure created
- Remind them that all YAML files are empty and ready to be filled in

## Important Notes

- All YAML files should be completely empty (0 bytes)
- Preserve the exact directory structure including subdirectory names (PRO, UAT)
- Do not copy the content from the original xac_pattern files
- The target directory should not exist beforehand - create it fresh

## Example Interaction

**User**: "Generate a new project from xac_pattern at F:\Projects\new_config"

**You should**:
1. Create the directory structure at F:\Projects\new_config
2. Create all 6 empty YAML files in their correct locations
3. Verify with tree command
4. Report success with the structure overview
