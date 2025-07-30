import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ColDef } from "@ag-grid-community/core";
import { useAppSelector } from "@/hooks/useReduxHook";
import { Button, Tooltip, Checkbox } from "@mui/material";
import { OverlayNoRowsTemplate } from "@/components/reusable/OverlayNoRowsTeplate";
import CustomLoadingOverlay from "@/components/reusable/CustomLoadingOverlay";


type Props = {
  setViewMenu?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedType: string;
  selectedVal: string;
  updateRow: any;
  user: any;
};

interface RowData {
  orgHierarchy: string[];
  name: string;
  url: string | null;
  status: React.ReactNode;
  action?: React.ReactNode;
  menu_key?: string;
  can_edit?: boolean;
  can_view?: boolean;
  can_delete?: boolean;
  can_add?: boolean;
}

// Utility function to flatten permissions data to row data
const flattenMenuHierarchy = (data: any): RowData[] => {
  let result: RowData[] = [];

  // Check if data has the permissions structure directly
  if (data && data.permissions) {
    const permissions = data.permissions;

    Object.keys(permissions).forEach((menuKey) => {
      const permission = permissions[menuKey];

      // Determine the appropriate action type based on the menu key
      let actionType = "create"; // default
      if (["einvoice", "ewaybill", "enote"].includes(menuKey)) {
        actionType = "generate";
      } else if (["dispatch_address", "hsn", "client"].includes(menuKey)) {
        actionType = "add";
      }

      // Get the permission value for the action type
      const actionValue =
        permission[actionType] ||
        permission.create ||
        permission.add ||
        permission.generate ||
        0;

      result.push({
        orgHierarchy: [menuKey.replace(/_/g, " ").toUpperCase()],
        name: menuKey.replace(/_/g, " ").toUpperCase(),
        url: null, // Not available in this structure
        status: "ACTIVE", // Default status
        menu_key: menuKey,
        can_edit: permission.update === 1,
        can_add: actionValue === 1,
        can_delete: permission.delete === 1 || permission.cancel === 1,
        can_view: permission.view === 1,
      });
    });
  } else if (data && data.data && data.data.permissions) {
    // Handle the nested structure if it exists
    const permissions = data.data.permissions;

    Object.keys(permissions).forEach((menuKey) => {
      const permission = permissions[menuKey];

      // Determine the appropriate action type based on the menu key
      let actionType = "create"; // default
      if (["einvoice", "ewaybill", "enote"].includes(menuKey)) {
        actionType = "generate";
      } else if (["dispatch_address", "hsn", "client"].includes(menuKey)) {
        actionType = "add";
      }

      // Get the permission value for the action type
      const actionValue =
        permission[actionType] ||
        permission.create ||
        permission.add ||
        permission.generate ||
        0;

      result.push({
        orgHierarchy: [menuKey.replace(/_/g, " ").toUpperCase()],
        name: menuKey.replace(/_/g, " ").toUpperCase(),
        url: null, // Not available in this structure
        status: "ACTIVE", // Default status
        menu_key: menuKey,
        can_edit: permission.update === 1,
        can_add: actionValue === 1,
        can_delete: permission.delete === 1 || permission.cancel === 1,
        can_view: permission.view === 1,
      });
    });
  } else if (Array.isArray(data)) {
    // Handle the old hierarchical structure if needed
    data.forEach((item: any) => {
      const currentHierarchy = [item.name];
      result.push({
        orgHierarchy: currentHierarchy,
        name: item.name,
        url: item.url,
        status: item.is_active === 1 ? "ACTIVE" : "INACTIVE",
        menu_key: item.menu_key,
        can_edit: item.can_edit == 1 ? true : false,
        can_add: item.can_add == 1 ? true : false,
        can_delete: item.can_delete == 1 ? true : false,
        can_view: item.can_view == 1 ? true : false,
      });

      if (item.children && item.children.length > 0) {
        result = result.concat(flattenMenuHierarchy(item.children));
      }
    });
  }

  return result;
};

const CustomHeader = () => (
  <div style={{ display: "flex", gap: "45px", fontWeight: "bold" }}>
    <span>View</span>
    <span>Edit</span>
    <span>Add</span>
    <span>Delete</span>
  </div>
);
const TreeDataMenu: React.FC<Props> = ({
  updateRow,
  selectedType,
  selectedVal,
  user,
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<RowData[]>([]);
  const { menuList, menuListLoading } = useAppSelector((state) => state.menu);

  const [columnDefs] = useState<ColDef[]>([
    {
      field: "name",
      headerName: "Menu Name",
      filter: true,
      maxWidth: 300,
      minWidth: 150,
      autoHeight: true,
    },
    {
      headerComponent: CustomHeader,
      field: "action",
      cellRenderer: (params: any) => {
        const [isEdit, setIsEdit] = useState<boolean>(
          params.data?.can_edit || false
        );
        const [isAdd, setIsAdd] = useState<boolean>(
          params.data?.can_add || false
        );
        const [isView, setIsView] = useState<boolean>(
          params.data?.can_view || false
        );
        const [isDelete, setIsDelete] = useState<boolean>(
          params.data?.can_delete || false
        );

        // Update local state when params.data changes
        useEffect(() => {
          setIsEdit(params.data?.can_edit || false);
          setIsAdd(params.data?.can_add || false);
          setIsView(params.data?.can_view || false);
          setIsDelete(params.data?.can_delete || false);
        }, [params.data]);

        if (!params.data?.menu_key) return null;

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className="permissions-group"
              style={{ display: "flex", gap: "45px" }}
            >
              <Tooltip title="View">
                <Checkbox
                  className="permission-checkbox"
                  onChange={(e) => setIsView(e.target.checked)}
                  checked={isView}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <Checkbox
                  className="permission-checkbox"
                  onChange={(e) => setIsEdit(e.target.checked)}
                  checked={isEdit}
                />
              </Tooltip>
              <Tooltip title="Add">
                <Checkbox
                  className="permission-checkbox"
                  onChange={(e) => setIsAdd(e.target.checked)}
                  checked={isAdd}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Checkbox
                  className="permission-checkbox"
                  onChange={(e) => setIsDelete(e.target.checked)}
                  checked={isDelete}
                />
              </Tooltip>
            </div>
            <Button
              onClick={() => {
                updateRow(params, isView, isEdit, isAdd, isDelete);
              }}
              variant="contained"
              color="primary"
              style={{
                marginLeft: "50px",
                visibility: params.data ? "visible" : "hidden",
              }}
            >
              Update
            </Button>
          </div>
        );
      },
      sortable: false,
      filter: false,
      maxWidth: 800,
    },
  ]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      floatingFilter: true,
      filter: "agTextColumnFilter",
    }),
    []
  );

  const autoGroupColumnDef = useMemo<ColDef>(
    () => ({
      headerName: "Menu Hierarchy",
      maxWidth: 300,
      minWidth: 200,
      autoHeight: true,
      cellRendererParams: {
        suppressCount: true,
      },
    }),
    []
  );

  const getDataPath = useCallback((data: RowData) => {
    return data.orgHierarchy;
  }, []);
  console.log(menuList);
  useEffect(() => {
    // Only set the rowData when menuList is not empty
    if (menuList && (user || selectedVal) && selectedType) {
      setRowData(flattenMenuHierarchy(menuList));
    }
  }, [menuList, selectedType, selectedVal, user]);

  return (
    <div className="ag-theme-quartz h-[calc(100vh-175px)]">
      <AgGridReact
        overlayNoRowsTemplate={OverlayNoRowsTemplate}
        loading={menuListLoading}
        loadingOverlayComponent={CustomLoadingOverlay}
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        autoGroupColumnDef={autoGroupColumnDef}
        treeData={true}
        groupDefaultExpanded={-1}
        suppressCellFocus={true}
        getDataPath={getDataPath}
        pagination
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 25, 50]}
      />
    </div>
  );
};

export default TreeDataMenu;
