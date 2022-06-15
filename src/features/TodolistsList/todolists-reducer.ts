import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {handleServerNetworkError} from "../../utils/error-utils";
import {AxiosError} from "axios";


// thunks
export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodolists', async (param, {dispatch, rejectWithValue}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {todolists: res.data}
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(error)
    }
})

export const removeTodolistTC = createAsyncThunk('todolists/removeTodolists', async (param: {todolistId: string}, {dispatch, rejectWithValue}) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    dispatch(changeTodolistEntityStatusAC({id: param.todolistId, status: 'loading'} ))
    try {
        const res = await todolistsAPI.deleteTodolist(param.todolistId)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {id: param.todolistId}
    } catch (err: any) {
        const error: AxiosError = err
        handleServerNetworkError(error, dispatch)
        return rejectWithValue(error)
    }
})

export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        console.log('creatingggggggggggggg111')
        todolistsAPI.createTodolist(title)
            .then((res) => {
                console.log('creatingggggggggggggg222')
                dispatch(addTodolistAC({todolist: res.data.data.item}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id, title}))
            })
    }
}

const slice = createSlice({
    name: "todolists",
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        removeTodolistAC(state, action: PayloadAction<{id: string}>){
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        },
        addTodolistAC(state, action: PayloadAction<{todolist: TodolistType}>){
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitleAC(state, action: PayloadAction<{id: string, title: string}>){
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        },
        changeTodolistFilterAC(state, action: PayloadAction<{id: string, filter: FilterValuesType}>){
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{id: string, status: RequestStatusType}>){
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state[index].entityStatus = action.payload.status
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        })
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) {
                state.splice(index, 1)
            }
        })
    }
})

export const todolistsReducer = slice.reducer

export const {
    //removeTodolistAC,
    addTodolistAC,
    changeTodolistTitleAC,
    changeTodolistFilterAC,
    changeTodolistEntityStatusAC,
    //setTodolistsAC
} = slice.actions




// types
//export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;



//export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;



export type RemoveTodolistActionType = ReturnType<typeof removeTodolistTC.fulfilled>;
//export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
// type ActionsType =
//     | RemoveTodolistActionType
//     | AddTodolistActionType
//     | ReturnType<typeof changeTodolistTitleAC>
//     | ReturnType<typeof changeTodolistFilterAC>
//     | SetTodolistsActionType
//     | ReturnType<typeof changeTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
type ThunkDispatch = Dispatch<SetAppStatusActionType | SetAppErrorActionType>
