import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHook";
import {
  fetchAdmins,
  changeAdminStatus,
  addAdmin,
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
  const { admins, loading, error, success } = useAppSelector(
    (state) => state.admin
  );
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdminUserId, setNewAdminUserId] = useState("");

  React.useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

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

  const handleStatusChange = async (admin: Admin) => {
    const newStatus = admin.is_active === 1 ? 0 : 1;
    await dispatch(
      changeAdminStatus({ userId: admin.user_id, status: newStatus })
    );
  };

  const handleAddAdmin = async () => {
    if (!newAdminUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a User ID",
        variant: "destructive",
      });
      return;
    }

    await dispatch(addAdmin(newAdminUserId.trim()));
    setNewAdminUserId("");
    setIsAddDialogOpen(false);
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Enter the User ID of the person you want to make an admin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={newAdminUserId}
                    onChange={(e) => setNewAdminUserId(e.target.value)}
                    placeholder="Enter User ID"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin} disabled={loading}>
                  Add Admin
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
                            disabled={loading}
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
