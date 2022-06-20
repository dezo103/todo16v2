import {useDispatch} from "react-redux";
import {store} from "../app/store";

type AppDispatchType = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatchType>()