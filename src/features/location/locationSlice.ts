import axiosInstance from "@/api/spigenDashApi";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import {
  AddTabType,
  AllotLocationListResponse,
  AllotLocationType,
  LocationListResponse,
  LocationState,
} from "@/features/location/locationTypes";
import { showToast } from "@/utills/toasterContext";

// Initial state
const initialState: LocationState = {
  createMenuLoading: false,
  loading: false,
  locationList: null,
  userList: null,
  deleteMenuLoading: false,
  disableMenuLoading: false,
  isId: null,
  allotLocationList: null,
  allotLocationLoading: false,
};

// Async Thunks
export const addTab = createAsyncThunk<AxiosResponse<any>, AddTabType>(
  "location/addTab",
  async (payload) => {
    const response = await axiosInstance.post("/location/add", payload);
    return response;
  }
);

export const allotLocation = createAsyncThunk<
  AxiosResponse<AllotLocationListResponse>,
  AllotLocationType
>("location/allotLocation", async (payload) => {
  const response = await axiosInstance.post(
    "/location/location_allotted",
    payload
  );
  return response;
});

export const updateAllotLocation = createAsyncThunk<
  AxiosResponse<AllotLocationListResponse>,
  AllotLocationType
>("location/updateAllotLocation", async (payload) => {
  const response = await axiosInstance.put(
    "/location/location_allotted_update",
    payload
  );
  return response;
});

export const getLocationList = createAsyncThunk<
  AxiosResponse<LocationListResponse>
>("location/getLocationList", async () => {
  const response = await axiosInstance.get("/location/list");
  return response;
});

export const getAllocatedLocationList = createAsyncThunk<
  AxiosResponse<LocationListResponse>
>("location/getAllocatedLocationList", async () => {
  const response = await axiosInstance.get("/location/fetch_loc_all");
  return response;
});

export const fetchLocationUpdate = createAsyncThunk<AxiosResponse<any>, string>(
  "location/fetchLocationUpdate",
  async (id) => {
    const response = await axiosInstance.get(
      `/location/fetch_location_all_update/${id}`
    );
    return response;
  }
);

// Slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getLocationList
      .addCase(getLocationList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLocationList.fulfilled, (state, action) => {
        const { data } = action.payload;
        if (data?.success) {
          state.locationList = data?.data;
        }
        state.loading = false;
      })
      .addCase(getLocationList.rejected, (state) => {
        state.loading = false;
        state.locationList = null;
      })

      // getAllocatedLocationList
      .addCase(getAllocatedLocationList.pending, (state) => {
        state.disableMenuLoading = true;
      })
      .addCase(getAllocatedLocationList.fulfilled, (state, action) => {
        const { data } = action.payload;
        if (data?.success) {
          state.allotLocationList = data?.data;
        }
        state.disableMenuLoading = false;
      })
      .addCase(getAllocatedLocationList.rejected, (state) => {
        state.disableMenuLoading = false;
        state.allotLocationList = null;
      })

      .addCase(fetchLocationUpdate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationUpdate.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchLocationUpdate.rejected, (state) => {
        state.loading = false;
      })
      // allotLocation
      .addCase(allotLocation.pending, (state) => {
        state.allotLocationLoading = true;
      })
      .addCase(allotLocation.fulfilled, (state, action) => {
        const { data } = action.payload;
        if (data?.success) {
          showToast(data?.message, "success");
        }
        state.allotLocationLoading = false;
      })
      .addCase(allotLocation.rejected, (state) => {
        state.allotLocationLoading = false;
      });
  },
});

export default locationSlice.reducer;
