# Backend setup

## Database update

For an existing PostgreSQL database, apply the internship application migration before deploying the updated API:

```powershell
psql $env:DATABASE_URL -f backend/migrations/20261107_employer_application_uploads.sql
```

For a new database, use `schema.sql`, which includes the same application table and internship form URL column.

## Uploaded files

Company logos and employer application-form PDFs are public files served from `/uploads`. Applicant CVs are stored separately and can only be downloaded by the applicant, the host company that owns the internship, or an administrator.

By default, uploads are stored in `backend/uploads` and `backend/private_uploads`. Set `UPLOADS_DIR` and `PRIVATE_UPLOADS_DIR` to persistent storage locations for deployed environments; the filesystem used by the API must retain both directories across restarts and deployments.
