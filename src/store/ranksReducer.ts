import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { ranksState } from "src/types/types";
import { clearSimilarArrayObjects } from "../utils";
import { rankActions } from "./store";

const initialState = {
  ranks: null,
};

const rankSlice = createSlice({
  name: "device",
  initialState: initialState,
  reducers: {
    addRank(state: ranksState, { payload }) {
      const newRanksObject = Array.isArray(payload)
        ? clearSimilarArrayObjects(payload, "RankId")
        : {};
      const oldRanksObject = Array.isArray(state.ranks)
        ? clearSimilarArrayObjects(state.ranks, "RankId")
        : {};
      const combinedRanks = { ...oldRanksObject, ...newRanksObject };
      const ranksToArray = [
        ...Object.entries(combinedRanks).map((rankArr) => rankArr[1]),
      ];
      state.ranks = [...ranksToArray];
      console.log("RANK", state.ranks);
    },
  },
});

export const getRanksAction = () => {
  return async (dispatch: Function) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_DOMAIN}/api/ranks/mini`
    );

    dispatch(rankActions.addRank(response?.data));
  };
};

export default rankSlice;
