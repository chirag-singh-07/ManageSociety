# Full Admin Panel Implementation Guide

## ✅ COMPLETED

1. **API Functions** (`admin-panel/src/api/http.ts`)
   - ✅ Member management (getMembers, updateMemberStatus, createInviteCode)
   - ✅ Dashboard (getDashboard)
   - ✅ Complaints (getComplaints, updateComplaintStatus, assignComplaint, addComment)
   - ✅ Notices (getNotices, createNotice, updateNotice, deleteNotice)
   - ✅ File uploads (getPresignedUrl, uploadFile)
   - ✅ Society settings (getSociety, updateSociety)

2. **Pages with Backend Integration**
   - ✅ Login page
   - ✅ Profile page  
   - ✅ Members list with CRUD
   - ✅ Add Member (invite code generation)
   - ✅ Dashboard with real metrics

## 📋 IMPLEMENTATION GUIDE FOR REMAINING PAGES

### Pattern Used Throughout
All pages follow this pattern:
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState<Type[]>([]);
const [filteredData, setFilteredData] = useState<Type[]>([]);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await getFunction();
    setData(response.data);
    setFilteredData(response.data);
  } catch (err) {
    toast.error(err message);
  } finally {
    setLoading(false);
  }
};
```

### Notices Page Implementation
- Replace mock `notices` array with API call
- Use `getNotices()` to fetch
- Add create/delete functionality  
- Search and filter by audience

### Complaints Page Implementation
- Fetch with `getComplaints(status?)`
- Support status filtering
- Add status update with `updateComplaintStatus()`
- Show assigned admin info
- Allow assigning with `assignComplaint()`

### Maintenance Page Implementation
- Check backend for maintenance endpoints in modules/
- Use similar pattern as complaints
- Allow creating, updating status, tracking completion

### Settings Page Implementation
- Fetch with `getSociety()`
- Update with `updateSociety(data)`
- Show society name, location, settings
- Allow editing core settings

### Notifications Page Implementation
- Create API functions for notifications
- Fetch user notifications
- Allow marking as read/delete

## File Upload Integration

### How It Works:
```typescript
// Get presigned URL
const presignResponse = await getPresignedUrl(
  fileName,
  file.type,
  file.size
);

// Upload to S3
if (presignResponse.ok) {
  await uploadFile(presignResponse.uploadUrl, file);
  // Use presignResponse.publicUrl or fileId in notices/complaints
}
```

### For Notices with Attachments:
```typescript
const notice = await createNotice(
  title,
  body,
  audience,
  attachments // Array of {fileId, publicUrl}
);
```

### For Complaints with Attachments:
```typescript
const complaint = await addComplaintComment(
  complaintId,
  message,
  attachments // Array of {fileId, publicUrl}
);
```

## Backend Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/dashboard` | GET | Fetch dashboard metrics |
| `/api/admin/users` | GET | List members |
| `/api/admin/users/{id}/status` | POST | Update member status |
| `/api/admin/invite-codes` | POST | Create invite code |
| `/api/admin/notices` | GET/POST | List/create notices |
| `/api/admin/notices/{id}` | PATCH/DELETE | Update/delete notice |
| `/api/admin/complaints` | GET | List complaints |
| `/api/admin/complaints/{id}/status` | POST | Update complaint status |
| `/api/admin/complaints/{id}/assign` | POST | Assign complaint |
| `/api/admin/society` | GET/PATCH | Get/update society settings |
| `/api/files/presign` | POST | Get presigned URL for upload |

## Next Steps

1. Update `NoticesList.tsx` to use `getNotices()` and `deleteNotice()`
2. Update `CreateNotice.tsx` to use `createNotice()` with file upload
3. Update `ComplaintsList.tsx` to use `getComplaints()` and status filters
4. Update `ComplaintDetails.tsx` to use `getComplaint()` and `updateComplaintStatus()`
5. Update `SettingsPage.tsx` to use `getSociety()` and `updateSociety()`
6. Update `MaintenanceList.tsx` (check for endpoints first)

## Development Mode Testing

Start backend:
```bash
cd backend
npm run dev
```

Start frontend:
```bash
cd admin-panel
npm run dev
```

Test APIs with:
- Postman/Insomnia
- Or check Network tab in DevTools

## Common Issues & Solutions

**CORS Error**: Ensure `ALLOWED_ORIGINS` in backend includes frontend URL
**401 Unauthorized**: Token refresh is automatic, check session storage
**File Upload Fails**: Verify S3 config and file size limits
**Mock Data Still Showing**: Make sure you replaced all `const data = []` with API calls
