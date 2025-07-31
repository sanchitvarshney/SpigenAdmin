import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  fetchAdmins,
  fetchUsers,
  changeAdminStatus,
  addAdmin,
  clearSuccess,
  clearError,
  Admin,
} from "@/features/admin/adminSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FiEdit2,
  FiEye,
  FiUserPlus,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";

const AdminListTable = () => {
  const dispatch = useAppDispatch();
  const { admins, users, loading, addLoading, statusLoading, error, success } =
    useAppSelector((state) => state.admin);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  React.useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  React.useEffect(() => {
    if (isAddDialogOpen) {
      dispatch(fetchUsers(""));
    }
  }, [isAddDialogOpen, dispatch]);

  // Click outside handler to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-search-container")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    if (success) {
      toast({
        title: "Success",
        description: success,
        variant: "default",
      });
      // Only refresh the list for add admin, not for status changes
      if (success === "Admin added successfully") {
        dispatch(fetchAdmins());
      }
    }
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [success, error, toast, dispatch]);

  // Clear success and error messages after showing toast
  React.useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        if (success) dispatch(clearSuccess());
        if (error) dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  const handleStatusChange = async (admin: Admin) => {
    const newStatus = admin.is_active === 1 ? 0 : 1;
    try {
      await dispatch(
        changeAdminStatus({ userId: admin.user_id, status: newStatus })
      );
    } catch (error) {
      console.error("Error changing admin status:", error);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUserId.trim()) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(addAdmin(selectedUserId.trim()));
      setSelectedUserId("");
      setUserSearchTerm("");
      setShowUserDropdown(false);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const filteredAdmins = (admins || []).filter(
    (admin) =>
      admin.user_id?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      admin.user_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      admin.Email_ID?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
          <p className="text-gray-600">Manage system administrators</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => dispatch(fetchAdmins())}
            disabled={loading}
          >
            <FiRefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FiUserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-none">
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-semibold">
                  Add New Admin
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Select a user from the dropdown to make them an admin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="userId"
                    className="text-sm font-medium text-gray-700"
                  >
                    Select User
                  </Label>
                  <div className="relative user-search-container">
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                        dispatch(fetchUsers(e.target.value));
                      }}
                      onFocus={() => {
                        setShowUserDropdown(true);
                        if (!userSearchTerm) {
                          dispatch(fetchUsers(""));
                        }
                      }}
                      className="w-full"
                    />
                    {showUserDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
                        {users.length > 0 ? (
                          users.map((user) => (
                            <div
                              key={user.id}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors last:border-b-0"
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setUserSearchTerm(user.text);
                                setShowUserDropdown(false);
                              }}
                            >
                              <div className="font-medium text-gray-900">
                                {user.text.split("-")[0]?.trim()}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {user.text.split("-")[1]?.trim()}
                              </div>
                            </div>
                          ))
                        ) : loading ? (
                          <div className="px-4 py-3 text-gray-500 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Loading users...
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            No users found. Try a different search term.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedUserId && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                        Selected User ID
                      </div>
                      <div className="text-sm font-mono text-blue-900 mt-1">
                        {selectedUserId}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedUserId("");
                    setUserSearchTerm("");
                    setShowUserDropdown(false);
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAdmin}
                  disabled={addLoading || !selectedUserId}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {addLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Admin"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search admins by User ID, name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading admins...</span>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No admins found matching your search."
                : "No admins found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.user_id}>
                    <TableCell className="font-medium">
                      {admin.user_id}
                    </TableCell>
                    <TableCell>{admin.user_name || "N/A"}</TableCell>
                    <TableCell>{admin.Email_ID || "N/A"}</TableCell>
                    <TableCell>{admin.Mobile_No || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(admin.is_active)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <FiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={admin.is_active === 1}
                            onCheckedChange={() => handleStatusChange(admin)}
                            disabled={statusLoading}
                          />
                          <span className="text-sm text-gray-500">
                            {admin.is_active === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Admin Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div>
                <Label>User ID</Label>
                <p className="text-sm text-gray-600">{selectedAdmin.user_id}</p>
              </div>
              <div>
                <Label>Name</Label>
                <p className="text-sm text-gray-600">
                  {selectedAdmin.user_name || "N/A"}
                </p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-600">
                  {selectedAdmin.Email_ID || "N/A"}
                </p>
              </div>
              <div>
                <Label>Mobile</Label>
                <p className="text-sm text-gray-600">
                  {selectedAdmin.Mobile_No || "N/A"}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedAdmin.is_active)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div>
                <Label>User ID</Label>
                <Input value={selectedAdmin.user_id} disabled />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    checked={selectedAdmin.is_active === 1}
                    onCheckedChange={() => handleStatusChange(selectedAdmin)}
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedAdmin.is_active === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminListTable;
