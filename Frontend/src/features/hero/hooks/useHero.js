import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  heroLoading,
  heroSuccess,
  heroFailure,
} from "../state/hero.slice";

import {
  getActiveHero,
  createHero,
} from "../service/hero.api";

const useHero = () => {
  const dispatch = useDispatch();

  const {
    hero,
    isLoading,
    error,
  } = useSelector((state) => state.sellerHero);

  // ==========================================
  // GET ACTIVE HERO
  // ==========================================
  const handleGetActiveHero = useCallback(async () => {
    try {
      dispatch(heroLoading());

      const data = await getActiveHero();

      dispatch(heroSuccess(data?.hero || null));

      return data;
    } catch (error) {
      console.error("Get active hero error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to load hero banner";

      dispatch(heroFailure(message));

      throw error;
    }
  }, [dispatch]);

  // ==========================================
  // CREATE / UPLOAD HERO
  // ==========================================
  const handleCreateHero = useCallback(
    async (images) => {
      try {
        if (!images || images.length === 0) {
          throw new Error("Please select at least one image.");
        }

        dispatch(heroLoading());

        const data = await createHero(images);

        dispatch(heroSuccess(data?.hero || null));

        return data;
      } catch (error) {
        console.error("Create hero error:", error);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to upload hero banner";

        dispatch(heroFailure(message));

        throw error;
      }
    },
    [dispatch]
  );

  return {
    hero,
    isLoading,
    error,

    handleGetActiveHero,
    handleCreateHero,
  };
};

export default useHero;