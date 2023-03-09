import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRanksAction } from "../store/ranksReducer";

class OptionsType {
  constructor() {
    this.rankOptions = [];
    this.setRankOptions = () => {};
  }
}

const useRanks = (/**@type  OptionsType */ options) => {
  const ranks = useSelector((state) => state.ranks.ranks);
  const [fetchingRanks, setFetchingRanks] = useState(false);
  const dispatch = useDispatch();

  const handleFetchRanks = () => {
    if (!ranks && !fetchingRanks) {
      dispatch(getRanksAction());
      setFetchingRanks(true);
    }
  };

  handleFetchRanks();

  useEffect(() => {
    window.addEventListener("online", handleFetchRanks);

    return () => {
      window.removeEventListener("online", handleFetchRanks);
    };
  }, []);

  useEffect(() => {
    if (!options?.rankOptions)
      options?.setRankOptions(
        ranks?.map((rank) => ({
          key: rank?.RankId,
          value: rank?.RankId,
          text: rank?.RankName,
        }))
      );
  }, [ranks]);

  return ranks;
};
export default useRanks;
