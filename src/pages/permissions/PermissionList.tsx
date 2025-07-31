import React, { useEffect, useRef } from "react";
import PermissionTable from "@/components/table/permissions/PermissionTable";
import {
  getRoleMenu,
  getUserMenu,
  saveRoleMenuPermission,
  saveUserMenuPermission,
} from "@/features/menu/menuSlice";
import { useAppDispatch } from "@/hooks/useReduxHook";
import { Autocomplete, FormControl, TextField, Button } from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { setIsId } from "@/features/menu/isIdReducer";
import { showToast } from "@/utills/toasterContext";
import SelectUser, {
  UserType,
} from "@/components/reusable/selectors/SelectUser";
const schema = z.object({
  type: z.string().nonempty("Project name is required"),
  role: z.string().nonempty("Page name is required"),
  project: z.string().nonempty("Project name is required"),
});
// Infer the form values from Zod schema
type FormValues = z.infer<typeof schema>;

const PermissionList: React.FC = () => {
  const [selectedVal, setSelectedVal] = React.useState<any>("");
  const [selectedType, setSelectedType] = React.useState<any>("");
  const [user, setUser] = React.useState<UserType | null>(null);
  const tableRef = useRef<any>(null);
  const {
    // handleSubmit,
    control,
    // reset,
    // watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "",
      role: "",
    },
  });

  const dispatch = useAppDispatch();

  const updateRow = (permissions: any) => {
    let newtype = localStorage.getItem("selectedType");
    const userId = localStorage.getItem("selectedVal");

    if (newtype == "User") {
      // Make a single API call with all permissions data
      const payload = {
        permissions: permissions,
      };

      dispatch(saveUserMenuPermission(payload))
        .then((res: any) => {
          if (res?.payload?.data?.success) {
            getlist();
            showToast("All permissions updated successfully", "success");
          } else {
            getlist();
            showToast(
              res?.payload?.data?.message || "Failed to update permissions",
              "error"
            );
          }
        })
        .catch((error: any) => {
          console.error("Error updating permissions:", error);
          showToast("Error updating permissions", "error");
        });
    } else {
      // Handle role permissions similarly
      const payload = {
        permissions: permissions,
      };

      dispatch(saveRoleMenuPermission(payload))
        .then((res: any) => {
          if (res?.payload?.data?.success) {
            getlist();
            showToast("All permissions updated successfully", "success");
          } else {
            getlist();
            showToast(
              res?.payload?.data?.message || "Failed to update permissions",
              "error"
            );
          }
        })
        .catch((error: any) => {
          console.error("Error updating permissions:", error);
          showToast("Error updating permissions", "error");
        });
    }
  };

  const getlist = () => {
    const selectedVal = localStorage.getItem("selectedVal");
    if (selectedVal !== null) {
      const id = selectedVal;
      if (localStorage.getItem("selectedType") == "User") {
        dispatch(getUserMenu(id)).then((res: any) => {
          console.log("response", res);
        });
      } else {
        dispatch(getRoleMenu(id)).then((res: any) => {
          console.log("response", res);
        });
      }
    } else {
      // Handle the case where selectedVal is null
    }
  };
  useEffect(() => {
    if (selectedVal.length) {
      dispatch(setIsId(selectedVal));
      localStorage.setItem("selectedVal", selectedVal);
      localStorage.setItem("selectedType", selectedType);
      getlist();
    } else {
    }
  }, [selectedVal, selectedType, user]);
  let type = [{ id: "User", text: "User" }];

  const handleTypeChange = (newValue: any) => {
    setSelectedType(newValue?.id || "");
    setSelectedVal(""); // Clear selected value when changing the type
    setUser(null);
  };

  return (
    <div className="">
      <form
        className="h-[100px] flex items-center  px-[20px] border-b"
        //  onSubmit={handleSubmit(onSubmit)}
      >
        <div className=" flex max-w-[70%] gap-[30px]">
          {/* Project Name */}
          <div className="flex gap-4 ">
            <FormControl
              variant="standard"
              sx={{ minWidth: 300 }}
              error={!!errors.project}
            >
              {/* <InputLabel>Type</InputLabel> */}
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={type} // Options for the type selection
                    getOptionLabel={(option) => option.text} // How to display the options in the dropdown
                    onChange={(e, newValue) => {
                      handleTypeChange(newValue); // Update selected type by its id
                      console.log(e);
                    }}
                    // Set the value based on the selected type id or undefined if not selected
                    value={
                      type.find((option) => option.id === selectedType) ||
                      undefined
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Type"
                        variant="filled"
                      />
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    } // Compare option and selected value based on id
                    disableClearable // Prevent clearing of the input field
                  />
                )}
              />
              {errors.project && (
                <p className="text-red-600 text-[13px]">
                  {errors.project.message}
                </p>
              )}
            </FormControl>
            <FormControl
              variant="standard"
              sx={{ minWidth: 300 }}
              error={!!errors.project}
            >
              {/* <InputLabel>{selectedType ? selectedType : 'Select an option'}</InputLabel> */}

              <SelectUser
                value={user}
                onChange={(value) => {
                  setUser(value);
                  setSelectedVal(value?.id);
                }}
              />

              {errors.project && (
                <p className="text-red-600 text-[13px]">
                  {errors.project.message}
                </p>
              )}
            </FormControl>
          </div>
        </div>
        <div className="ml-auto">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Call the update function from the table component
              if (tableRef.current && tableRef.current.handleUpdateAll) {
                tableRef.current.handleUpdateAll();
              }
            }}
            disabled={!selectedVal || !selectedType}
          >
            Update All
          </Button>
        </div>
      </form>
      <div className="">
        <PermissionTable
          selectedVal={selectedVal}
          selectedType={selectedType}
          updateRow={updateRow}
          user={user}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default PermissionList;
