import { createSlice } from "@reduxjs/toolkit";
import {API, APIAuthenticated} from "../http/index"
import { STATUS } from "../globals/status/Status";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    data: [],
    userList:[],
    status: STATUS.LOADING,
    token: "",
    profile: ""
  },
  reducers: {
    setUserData(state, action) {
      state.data = action.payload;
      console.log()
    },
    setUserList(state, action) {
      state.userList = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    resetStatus(state) {
      state.status = STATUS.LOADING;
    },
    setToken(state, action) {
      state.token = action.payload;
      console.log(state.token);
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    setUpdateUserProfile(state, action) {
      const index = state.data.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.data[index] = {
          ...state.data[index],
          ...action.payload.data
        }
      }
    },
  },
});

export const {setUserData, setStatus, resetStatus, setToken, setProfile, setUpdateUserProfile, setUserList} = authSlice.actions;
export default authSlice.reducer;

//signup
export function register(data) {
  return async function registerUserThunk(dispatch) {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const response = await API.post("/api/register", data);
      if (response.status === 200) {
        dispatch(setUserData(response.data)); 
        dispatch(setStatus(STATUS.SUCCESS));
      } else {
        dispatch(setStatus(STATUS.ERROR));
      }
    } catch (err) {
      dispatch(setStatus(STATUS.ERROR));
    }
  };
}

// login
export function login(data) {
  return async function loginThunk(dispatch) {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const response = await API.post("/api/login", data);

      if (response.status === 200) {
        const { token, data: userData } = response.data;

        dispatch(setProfile(userData));
        dispatch(setToken(token));

        localStorage.setItem('token', token);
        localStorage.setItem('role', userData.role); 


        dispatch(setStatus(STATUS.SUCCESS));
        return userData;
      } else {
        dispatch(setStatus(STATUS.ERROR));
        return null;
      }
    } catch (err) {
      dispatch(setStatus(STATUS.ERROR));
      return null;
    }
  };
}

//profile
export function userProfile() {
  return async function userProfileThunk(dispatch) {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const response = await APIAuthenticated.get("/api/profile");
      if (response.status === 200) {
        const { data } = response.data;
        dispatch(setProfile(data));
        dispatch(setStatus(STATUS.SUCCESS));
      } else {
        dispatch(setStatus(STATUS.ERROR));
      }
    } catch (err) {
      dispatch(setStatus(STATUS.ERROR));
    }
  }
}

//update user
export function updateUserProfile({ id, userData }) {
  return async function updateUserProfileThunk(dispatch) {
    dispatch(setStatus(STATUS.LOADING)); 
    try {
      const response = await APIAuthenticated.patch(
        `/api/update/${id}`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const { data } = response.data;
        dispatch(setUpdateUserProfile({ id, data }));
        dispatch(setStatus(STATUS.SUCCESS)); 
      } else {
        dispatch(setStatus(STATUS.ERROR)); 
        throw new Error('Update failed');
      }
    } catch (err) {
      dispatch(setStatus(STATUS.ERROR)); 
      throw err;
    }
  };
}


//profile
export function ListAllUser() {
  return async function ListAllUserThunk(dispatch) {
    dispatch(setStatus(STATUS.LOADING));
    try {
      const response = await APIAuthenticated.get("/api/getAllUsers");
      if (response.status === 200) {
        dispatch(setUserList(response.data));
        dispatch(setStatus(STATUS.SUCCESS));
      } else {
        dispatch(setStatus(STATUS.ERROR));
      }
    } catch (err) {
      dispatch(setStatus(STATUS.ERROR));
    }
  }
}