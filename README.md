# School Management — Angular Frontend

A CRUD admin UI for the ASP.NET Core + MongoDB `StudentManagement` API,
covering all six collections: **Students, Teachers, Majors, Groups, Class
Schedule, and Fee Payments**.

Built with Angular 18 (standalone components, no NgModules), plain
`HttpClient` services, and template-driven forms — no extra UI libraries.

## 1. Run the backend first

From the `StudentManagement` API project:

```bash
dotnet run
```

This starts the API at `http://localhost:5073` (see
`Properties/launchSettings.json`) and MongoDB must be reachable at
`mongodb://localhost:27017` with a `school_management` database (see
`appsettings.json`). The API's CORS policy only allows requests from
`http://localhost:4200`, which is Angular's default dev port — don't change
the port unless you also update `Program.cs`.

Import your seed JSON files into MongoDB collections first if they're empty:

```bash
mongoimport --db school_management --collection students --jsonArray --file school_managements_students.json
mongoimport --db school_management --collection teachers --jsonArray --file School_management_teachers.json
mongoimport --db school_management --collection majors --jsonArray --file School_management_majors.json
mongoimport --db school_management --collection groups --jsonArray --file School_management_Groups.json
mongoimport --db school_management --collection class_schedule --jsonArray --file school_management_class_schedule.json
mongoimport --db school_management --collection students_fees_payments --jsonArray --file School_management_students_fees_payments.json
```

## 2. Run the frontend

```bash
npm install
npm start
```

This runs `ng serve` on `http://localhost:4200`. Open that URL — the sidebar
lets you navigate between all six modules, and the home page pings every
endpoint to show live record counts.

If your API runs on a different host/port, there's exactly one place to
change it: `src/app/api-config.ts`.

## Notes on how it maps to the API

| Angular page     | API route                  | Backend model      |
|-------------------|-----------------------------|---------------------|
| Students          | `/api/Student`               | `Student`           |
| Teachers          | `/api/Teacher`               | `Teacher`           |
| Majors            | `/api/Major`                 | `Major`             |
| Groups            | `/api/Group`                 | `Group`             |
| Class schedule    | `/api/ClassSchedule`         | `ClassSchedule`     |
| Fee payments      | `/api/StudentFeePayment`     | `StudentFeePayment` |

- Numeric IDs (`studentId`, `teacherId`, etc.) are assigned by the server on
  create — the forms don't ask for them.
- JSON field names are camelCase because that's ASP.NET Core's default
  System.Text.Json output (e.g. C#'s `TotalStudents` becomes
  `totalStudents` in the wire format), which is what the TypeScript models
  in `src/app/models/` mirror.
- `Student.attendances` and `Student.exams` are nested arrays managed
  server-side; the student form edits the core profile fields only and
  preserves those arrays untouched on update.
- Comma-separated inputs (subjects, groups) are split/joined client-side
  into the string arrays the API expects.
- Update endpoints vary between returning `204 No Content` and `200 OK` with
  a body across controllers — the services handle both since Angular's
  `HttpClient` doesn't require a body to resolve successfully.

## Project structure

```
src/app/
  api-config.ts          single source of truth for the API base URL
  app.component.*         shell: sidebar nav + router outlet
  app.routes.ts            lazy-loaded routes per module
  models/                  TypeScript interfaces matching the C# models
  services/                one HttpClient CRUD service per collection
  pages/
    home/                  dashboard with live counts
    students/ teachers/ majors/ groups/ schedule/ payments/
                           each: list + search + inline create/edit form
```
