import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ColDef } from "@ag-grid-community/core";
import { useAppSelector } from "@/hooks/useReduxHook";
import { Tooltip, Checkbox } from "@mui/material";
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
      result.push({
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

const TreeDataMenu = forwardRef<any, Props>(
  ({ updateRow, selectedType, selectedVal, user }, ref) => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [localPermissions, setLocalPermissions] = useState<any>({});
    const { menuList, menuListLoading } = useAppSelector((state) => state.menu);

    // Handle update all permissions
    const handleUpdateAll = () => {
      updateRow(localPermissions);
    };

    // Expose the handleUpdateAll function to parent component
    useImperativeHandle(ref, () => ({
      handleUpdateAll,
    }));

    const [columnDefs] = useState<ColDef[]>([
      {
        field: "name",
        headerName: "Menu Name",
        filter: true,
        maxWidth: 500,
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

          // Update local permissions when checkboxes change
          const updateLocalPermissions = (
            menuKey: string,
            field: string,
            value: boolean
          ) => {
            setLocalPermissions((prev: any) => ({
              ...prev,
              [menuKey]: {
                ...prev[menuKey],
                [field]: value ? 1 : 0,
              },
            }));
          };

          return (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="permissions-group"
                style={{ display: "flex", gap: "45px" }}
              >
                <Tooltip title="View">
                  <Checkbox
                    className="permission-checkbox"
                    onChange={(e) => {
                      setIsView(e.target.checked);
                      updateLocalPermissions(
                        params.data.menu_key,
                        "view",
                        e.target.checked
                      );
                    }}
                    checked={isView}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Checkbox
                    className="permission-checkbox"
                    onChange={(e) => {
                      setIsEdit(e.target.checked);
                      updateLocalPermissions(
                        params.data.menu_key,
                        "update",
                        e.target.checked
                      );
                    }}
                    checked={isEdit}
                  />
                </Tooltip>
                <Tooltip title="Add">
                  <Checkbox
                    className="permission-checkbox"
                    onChange={(e) => {
                      setIsAdd(e.target.checked);
                      // Determine the correct field based on menu key
                      let field = "create";
                      if (
                        ["einvoice", "ewaybill", "enote"].includes(
                          params.data.menu_key
                        )
                      ) {
                        field = "generate";
                      } else if (
                        ["dispatch_address", "hsn", "client"].includes(
                          params.data.menu_key
                        )
                      ) {
                        field = "add";
                      }
                      updateLocalPermissions(
                        params.data.menu_key,
                        field,
                        e.target.checked
                      );
                    }}
                    checked={isAdd}
                  />
                </Tooltip>
                <Tooltip title="Delete">
                  <Checkbox
                    className="permission-checkbox"
                    onChange={(e) => {
                      setIsDelete(e.target.checked);
                      // Determine the correct field based on menu key
                      let field = "delete";
                      if (
                        [
                          "sell_request",
                          "sales_invoice",
                          "einvoice",
                          "ewaybill",
                          "enote",
                        ].includes(params.data.menu_key)
                      ) {
                        field = "cancel";
                      }
                      updateLocalPermissions(
                        params.data.menu_key,
                        field,
                        e.target.checked
                      );
                    }}
                    checked={isDelete}
                  />
                </Tooltip>
              </div>
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

    // Initialize local permissions when menuList changes
    useEffect(() => {
      if (
        menuList &&
        typeof menuList === "object" &&
        "permissions" in menuList
      ) {
        setLocalPermissions(menuList.permissions);
      }
    }, [menuList]);

    useEffect(() => {
      // Only set the rowData when menuList is not empty
      if (menuList && (user || selectedVal) && selectedType) {
        setRowData(flattenMenuHierarchy(menuList));
      }
    }, [menuList, selectedType, selectedVal, user]);

    return (
      <div className="ag-theme-quartz h-[calc(100vh-175px)] pl-2">
        <AgGridReact
          overlayNoRowsTemplate={OverlayNoRowsTemplate}
          loading={menuListLoading}
          loadingOverlayComponent={CustomLoadingOverlay}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          suppressCellFocus={true}
          pagination
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
        />
      </div>
    );
  }
);

TreeDataMenu.displayName = "TreeDataMenu";

export default TreeDataMenu;
