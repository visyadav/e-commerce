"use client";

import { useEffect, useState } from "react";
import { AdminUserDto, AdminUserDetailsDto } from "@/src/types/users";
import { PaginationMeta } from "@/src/types/api";
import { userService } from "@/src/services/users/user-service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import { format } from "date-fns";

export default function Permissions() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Create user state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Admin"
  });

  // Edit user state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isFetchingUserDetails, setIsFetchingUserDetails] = useState(false);
  
  const [editForm, setEditForm] = useState({ 
    firstName: "", 
    lastName: "", 
    phoneNumber: "",
    profileImageUrl: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    themeColor: "default"
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers(debouncedSearch || undefined, page, pageSize);
      setUsers(res.data || []);
      setPagination(res.pagination);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, debouncedSearch]);

  const handleToggleStatus = async (user: AdminUserDto) => {
    try {
      setUpdatingId(user.id);
      const newStatus = !user.isActive;
      await userService.toggleUserStatus(user.id, newStatus);
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);

      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
    } catch (error) {
      toast.error("Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateSubmit = async () => {
    try {
      setIsCreating(true);
      await userService.createUser(createForm);
      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      setCreateForm({ firstName: "", lastName: "", email: "", role: "Admin" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = async (user: AdminUserDto) => {
    setEditingUserId(user.id);
    setIsEditDialogOpen(true);
    setIsFetchingUserDetails(true);

    try {
      const details = await userService.getUserById(user.id);
      if (details) {
        setEditForm({
          firstName: details.firstName,
          lastName: details.lastName,
          phoneNumber: details.phoneNumber || "",
          profileImageUrl: details.profileImageUrl || "",
          address: details.address || "",
          city: details.city || "",
          state: details.state || "",
          country: details.country || "",
          zipCode: details.zipCode || "",
          themeColor: details.themeColor || "default"
        });
      }
    } catch (error) {
      toast.error("Failed to load user details");
      setIsEditDialogOpen(false);
    } finally {
      setIsFetchingUserDetails(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUserId) return;
    try {
      setIsSaving(true);
      await userService.updateUser(editingUserId, editForm);
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditForm(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
          <p className="text-muted-foreground">Manage backend administrative users.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 flex gap-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-[300px]"
          />
          <Button onClick={() => setIsCreateDialogOpen(true)}>Add User</Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Roles</th>
              <th className="px-6 py-3 font-medium">Joined Date</th>
              <th className="px-6 py-3 font-medium text-center">Created By</th>
              <th className="px-6 py-3 font-medium text-center">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={`border-b last:border-0 hover:bg-muted/50 ${!user.isActive && 'opacity-60 bg-muted/20'}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    {user.phoneNumber && <div className="text-xs text-muted-foreground">{user.phoneNumber}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {user.roles && user.roles.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(r => (
                          <span key={r} className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No roles</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.createdByName || 'System'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Switch
                        disabled={updatingId === user.id}
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleStatus(user)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{pagination.totalCount}</span> results
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPrevious} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <div className="flex items-center justify-center px-4 text-sm font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
            <DialogDescription>
              Update complete user information.
            </DialogDescription>
          </DialogHeader>
          {isFetchingUserDetails ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <Input id="firstName" value={editForm.firstName} onChange={handleFormChange} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <Input id="lastName" value={editForm.lastName} onChange={handleFormChange} />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                <Input id="phoneNumber" value={editForm.phoneNumber} onChange={handleFormChange} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="profileImageUrl" className="text-sm font-medium">Profile Image URL</label>
                <Input id="profileImageUrl" value={editForm.profileImageUrl} onChange={handleFormChange} />
              </div>

              <div className="grid gap-2 col-span-2">
                <label htmlFor="address" className="text-sm font-medium">Address</label>
                <Input id="address" value={editForm.address} onChange={handleFormChange} />
              </div>

              <div className="grid gap-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input id="city" value={editForm.city} onChange={handleFormChange} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="state" className="text-sm font-medium">State</label>
                <Input id="state" value={editForm.state} onChange={handleFormChange} />
              </div>

              <div className="grid gap-2">
                <label htmlFor="country" className="text-sm font-medium">Country</label>
                <Input id="country" value={editForm.country} onChange={handleFormChange} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="zipCode" className="text-sm font-medium">Zip Code</label>
                <Input id="zipCode" value={editForm.zipCode} onChange={handleFormChange} />
              </div>

              <div className="grid gap-2 col-span-2">
                <label htmlFor="themeColor" className="text-sm font-medium">Theme Color</label>
                <Input id="themeColor" value={editForm.themeColor} onChange={handleFormChange} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || isFetchingUserDetails}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Create a new user. The default password will be automatically generated (first 3 letters of first name + @ethical.in).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="createFirstName" className="text-sm font-medium">First Name</label>
              <Input
                id="createFirstName"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="createLastName" className="text-sm font-medium">Last Name</label>
              <Input
                id="createLastName"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="createEmail" className="text-sm font-medium">Email</label>
              <Input
                id="createEmail"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="createRole" className="text-sm font-medium">Role</label>
              <select
                id="createRole"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="SuperAdmin">SuperAdmin</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSubmit} disabled={isCreating || !createForm.firstName || !createForm.lastName || !createForm.email}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
