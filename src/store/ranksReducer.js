import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { clearSimilarArrayObjects } from "../utils";
import { rankActions } from "./store";

const initialState = {
  ranks: [],
};

const rankSlice = createSlice({
  name: "device",
  initialState: initialState,
  reducers: {
    addRank(state, { payload }) {
      const newRanksObject = clearSimilarArrayObjects(payload, "RankId");
      const oldRanksObject = clearSimilarArrayObjects(state.ranks, "RankId");
      const combinedRanks = { ...oldRanksObject, ...newRanksObject };
      const ranksToArray = [
        ...Object.entries(combinedRanks).map(([key, rank]) => rank),
      ];
      state.ranks = [...ranksToArray];
      console.log("RANK", state.ranks);
    },
  },
});

export const getRanksAction = () => {
  return async (dispatch) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_DOMAIN}/api/ranks/mini`
    );

    dispatch(rankActions.addRank(response?.data));
  };
};

export default rankSlice;
