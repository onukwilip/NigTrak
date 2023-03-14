import { AnyAction } from "redux";
import { rankOptionsType, selectorState } from "./../types/types";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRanksAction } from "../store/ranksReducer";

const useRanks = (options: rankOptionsType) => {
  const ranks = useSelector((state: selectorState) => state.ranks.ranks);
  const [fetchingRanks, setFetchingRanks] = useState(false);
  const dispatch = useDispatch();

  const handleFetchRanks = () => {
    if (!ranks && !fetchingRanks) {
      dispatch(getRanksAction() as unknown as AnyAction);
      setFetchingRanks(true);
    }
  };

  handleFetchRanks();

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
