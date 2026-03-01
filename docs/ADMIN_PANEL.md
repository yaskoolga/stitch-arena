# Admin Panel Documentation

## Overview

The StitchArena admin panel provides comprehensive tools for platform moderation, user management, and content oversight.

## Access

- **URL**: `/admin`
- **Authorization**: Email-based (configured via `ADMIN_EMAIL` in `.env`)
- **Current Admin**: yasko.olga@gmail.com

## Features

### 1. Dashboard (`/admin/dashboard`)

Platform overview with key metrics:
- Total users (with monthly trend)
- Total projects (with monthly trend)
- Total comments (with monthly trend)
- Active challenges count
- Pending reports count
- Banned users count

### 2. User Management (`/admin/users`)

**Features:**
- Search by name or email
- Filter by status (All / Active / Banned)
- View user statistics (projects, comments, reports)
- Ban/Unban users with reason
- Bulk operations (ban/unban multiple users)
- Export users to CSV

**Ban User:**
- Cannot ban yourself
- Banned users cannot sign in
- Ban reason is logged for audit

### 3. Project Moderation (`/admin/projects`)

**Features:**
- Search by title or description
- Filter by status (All / In Progress / Completed / Paused)
- View project details, author, stats
- Delete projects
- Bulk delete multiple projects
- Export projects to CSV
- View project in new tab

**Project Data:**
- Title, description, status
- Visibility (Public/Private)
- Author information
- Statistics (stitches, logs, comments, likes)
- Creation date

### 4. Comment Moderation (`/admin/comments`)

**Features:**
- Search by comment text
- View comment details, author, project
- Delete comments
- Bulk delete multiple comments
- Export comments to CSV
- View parent project

**Comment Data:**
- Comment text
- Author information
- Parent project details
- Created/Updated timestamps

### 5. Challenge Management (`/admin/challenges`)

**Features:**
- Filter by type (Speed / Streak / Completion)
- Filter by status (Active / Inactive)
- Edit challenge details
- Deactivate challenges
- Delete challenges
- View participant count

**Editable Fields:**
- Title
- Description
- Start date
- End date
- Target value
- Active status

### 6. Report System (`/admin/reports`)

**User Report Flow:**
1. Users can report: Comments, Projects, Users, Daily Logs
2. Report reasons: Spam, Inappropriate, Harassment, Other
3. Reports appear in admin panel with "pending" status

**Admin Review:**
- Filter by status (Pending / Reviewed / Resolved / Dismissed)
- View reporter and reported user
- Add admin notes
- Change status (Pending → Reviewed → Resolved/Dismissed)
- Bulk resolve or dismiss multiple reports
- Export reports to CSV

**Report Types:**
- `comment` - Inappropriate comment
- `project` - Inappropriate project content
- `user` - User behavior violation
- `dailyLog` - Inappropriate daily log entry

**Report Statuses:**
- `pending` - Awaiting admin review
- `reviewed` - Admin has seen but not resolved
- `resolved` - Issue addressed
- `dismissed` - Report deemed invalid

### 7. Audit Logs (`/admin/logs`)

**Features:**
- View all admin actions
- Filter by action type
- Filter by target type
- Export logs to CSV
- View action metadata (reasons, bulk flags)

**Logged Actions:**
- `ban_user` / `unban_user`
- `delete_project`
- `delete_comment`
- `resolve_report` / `dismiss_report`
- `update_challenge` / `deactivate_challenge` / `delete_challenge`

**Log Data:**
- Admin who performed action
- Action type
- Target type and ID
- Metadata (JSON with additional info)
- Timestamp

## Bulk Operations

All bulk operations are performed via the `BulkActionBar` component:

1. Select items using checkboxes
2. Fixed action bar appears at bottom of screen
3. Choose action (Ban, Unban, Delete, Resolve, Dismiss)
4. Confirm action with optional reason/note
5. All selected items are processed

**Bulk Actions by Section:**
- **Users**: Ban, Unban
- **Projects**: Delete
- **Comments**: Delete
- **Reports**: Resolve, Dismiss

## Data Export

All sections support CSV export via the "Export CSV" button:

- **Users**: id, name, email, role, ban status, stats, created date
- **Projects**: id, title, description, status, author, stats, created date
- **Comments**: id, text, author, project, created date
- **Reports**: id, type, reason, reporter, reported user, status, dates
- **Logs**: id, admin, action, target, metadata, timestamp

## API Endpoints

### Public Endpoints
- `POST /api/reports` - Create a report (authenticated users)

### Admin Endpoints (require admin role)

**Statistics:**
- `GET /api/admin/stats` - Platform metrics

**Users:**
- `GET /api/admin/users` - List users (paginated, searchable, filterable)
- `POST /api/admin/users/[id]/ban` - Ban/unban user

**Projects:**
- `GET /api/admin/projects` - List projects
- `DELETE /api/admin/projects/[id]` - Delete project

**Comments:**
- `GET /api/admin/comments` - List comments
- `DELETE /api/admin/comments/[id]` - Delete comment

**Challenges:**
- `GET /api/admin/challenges` - List challenges
- `PATCH /api/admin/challenges/[id]` - Update challenge
- `DELETE /api/admin/challenges/[id]` - Delete challenge

**Reports:**
- `GET /api/admin/reports` - List reports
- `PATCH /api/admin/reports/[id]` - Update report status

**Logs:**
- `GET /api/admin/logs` - List admin actions

**Bulk Operations:**
- `POST /api/admin/bulk` - Perform bulk action

**Export:**
- `GET /api/admin/export?type={users|projects|comments|reports|logs}` - Export CSV

## Database Schema

### User Model Extensions
```prisma
model User {
  role          String   @default("user")  // "user" | "admin"
  isBanned      Boolean  @default(false)
  bannedAt      DateTime?
  bannedReason  String?
  updatedAt     DateTime @default(now()) @updatedAt
}
```

### Report Model
```prisma
model Report {
  id             String   @id @default(cuid())
  type           String   // "comment" | "project" | "user" | "dailyLog"
  reason         String   // "spam" | "inappropriate" | "harassment" | "other"
  description    String?
  status         String   @default("pending") // "pending" | "reviewed" | "resolved" | "dismissed"
  reporterId     String
  reportedUserId String?
  resourceId     String?  // ID of reported content
  resolvedBy     String?
  resolvedAt     DateTime?
  adminNote      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### AdminLog Model
```prisma
model AdminLog {
  id         String   @id @default(cuid())
  adminId    String
  action     String   // "ban_user", "delete_comment", etc.
  targetType String   // "user", "project", "comment", "challenge", "report"
  targetId   String
  metadata   String?  // JSON with additional details
  createdAt  DateTime @default(now())
}
```

## Components

### Core Components
- `AdminSidebar` - Navigation menu
- `AdminTable` - Universal table with selection, pagination
- `AdminStatsCard` - Metric display card
- `BulkActionBar` - Bulk operations panel
- `ExportButton` - CSV export button

### Dialogs
- `UserBanDialog` - Ban/unban user with reason
- `ReportReviewDialog` - Review and resolve reports
- `ReportButton` - User-facing report button

## Security

### Authorization
- All admin routes protected by middleware
- `requireAdmin()` function checks user email against `ADMIN_EMAIL`
- Non-admin users redirected to `/dashboard`

### Audit Trail
- Every admin action is logged to `AdminLog` table
- Logs include: admin ID, action, target, metadata, timestamp
- Bulk actions are marked with `bulk: true` in metadata

### Validation
- Cannot ban yourself
- Cannot report yourself
- All inputs validated on server side

## Environment Variables

```env
ADMIN_EMAIL=yasko.olga@gmail.com
```

## Future Enhancements

### Role-Based Access Control
- Multiple admin levels (admin, moderator)
- Granular permissions per role
- Moderators can delete content but not ban users

### Email Notifications
- Notify admins of new reports
- Weekly summary of admin actions
- User notifications on ban/unban

### Analytics Dashboard
- Charts and graphs for trends
- User growth metrics
- Content moderation statistics
- Challenge participation trends

### Advanced Features
- Scheduled challenge creation
- Automated report triage
- User behavior scoring
- Content filtering rules
- Bulk user import
- IP ban support

## Troubleshooting

### "Forbidden" Error
- Check that your email matches `ADMIN_EMAIL` in `.env`
- Restart server after changing `.env`

### Actions Not Logged
- Ensure `logAdminAction()` is called after each action
- Check `AdminLog` table for entries

### Bulk Actions Failing
- Check browser console for error messages
- Verify selected IDs are valid
- Ensure proper permissions

## Development

### Adding New Admin Action
1. Create API endpoint in `/api/admin/`
2. Add authorization check: `const { session, error } = await requireAdmin()`
3. Perform action
4. Log action: `await logAdminAction(adminId, action, targetType, targetId, metadata)`
5. Return response

### Adding New Bulk Action
1. Add action to appropriate bulk actions array in `bulk-action-bar.tsx`
2. Handle action in `/api/admin/bulk` endpoint
3. Add logging for each item
4. Return count of affected items

### Adding New Export Type
1. Add case to `/api/admin/export` endpoint
2. Define data selection query
3. Map data to CSV format
4. Return CSV with appropriate filename
