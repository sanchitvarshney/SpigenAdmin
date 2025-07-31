import AdminListTable from "@/components/table/admin/AdminListTable";

const AdminManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminListTable />
      </div>
    </div>
  );
};

export default AdminManagement;
