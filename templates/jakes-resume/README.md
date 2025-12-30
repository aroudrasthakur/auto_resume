# Jake's Resume Template

This directory contains the vendored Jake's Resume LaTeX template files.

## Files

- `resume.cls`: LaTeX class file defining the resume style and macros
- `template.tex.jinja2`: Jinja2 template that uses the class file to generate resumes

## Usage

The template is rendered by the worker service using Jinja2, then compiled to PDF using Tectonic.

## Macros

The `resume.cls` file provides the following macros:

- `\resumeHeader`: Creates the header with name and contact information
- `\resumeSubheading{Company}{Location}{Role}{Date}`: Creates an experience/education entry
- `\resumeItemListStart` / `\resumeItemListEnd`: Start/end a bullet list
- `\resumeItem{Bullet text}`: Add a bullet point
- `\resumeSubItem{Category}{Items}`: Add a skill category with items

## Template Variables

The Jinja2 template expects the following variables:

- `name`: Full name
- `email`, `phone`, `location`, `linkedin`, `github`, `website`: Contact information
- `education`: List of education entries with `school`, `degree`, `major`, `gpa`, `start_date`, `end_date`, `location`, `highlights`
- `experience`: List of experience entries with `company`, `role`, `location`, `start_date`, `end_date`, `is_current`, `bullets`
- `projects`: List of project entries with `name`, `role`, `start_date`, `end_date`, `bullets`, `technologies`
- `skills`: Object with `categories` list, each containing `name` and `items`
- `include_projects`: Boolean to include projects section
- `include_skills`: Boolean to include skills section

