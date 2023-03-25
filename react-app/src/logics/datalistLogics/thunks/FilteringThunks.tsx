import { useReduxDispatch, useReduxSelector } from '../../../store/ReduxTypes';
import { dataActions } from '../../../store/datalistSlices/DataSlice';
import { modalActions } from '../../../store/datalistSlices/ModalSlice';
import { filteringActions } from '../../../store/datalistSlices/FilteringSlice';
import { useModalThunks } from './ModalThunks';
import { setYear, setMonth, setDay, getYear, getMonth, getDay } from '../Logics';
import { envFilterElements } from '../../../store/datalistSlices/FilteringSlice';
import type { Covids } from '../../../store/datalistSlices/DataSlice';
import type { ItemsFilters } from '../../../store/datalistSlices/FilteringSlice';
import { SetStateAction } from 'react';


export const useFilteringThunks = () => {
    const dispatch = useReduxDispatch();
    const { hideModalHandler, showModalHandler } = useModalThunks();

    const covids = useReduxSelector(state => state.data.covids);
    const covidsWithoutFilter = useReduxSelector(state => state.data.covidsWithoutFilter);
    const isOnlySelected = useReduxSelector(state => state.filtering.isOnlySelected);
    const selectedData = useReduxSelector(state => state.table.selectedData);
    const filters = useReduxSelector(state => state.filtering.filters);
    const filtersCopy = useReduxSelector(state => state.filtering.filtersCopy);
    const filterActive = useReduxSelector(state => state.filtering.filterActive);


    // Copy filters to filtersCopy array when close filters modal
    const deleteFiltersCopy = () => {
        let filtered = filters.map(item => {
            return { ...item }
        })
        dispatch(filteringActions.setFiltersCopy(filtered));
    };


    // Submit Filter button click
    const submitFiltersHandler = () => {
        let count = 0;
        dispatch(filteringActions.setFilters(filtersCopy.map(item => {
            if (item.min || item.max) count += 1;
            return { ...item }
        }))
        );
        dispatch(filteringActions.setFilterActive(count));
        dispatch(filteringActions.setIsFiltering(true));
        hideModalHandler('refModalFiltering');
    };


    // Delete All Filters button click
    const deleteAllFiltersHandler = (isFromModal: boolean) => {
        // if (filterActive !== 0 || isOnlySelected) {
        let array = envFilterElements;
        dispatch(filteringActions.setFiltersCopy(array));
        if (isFromModal) { dispatch(modalActions.setIsRefreshModal(true)) }
        else {
            dispatch(filteringActions.setIsOnlySelected(false));
            dispatch(filteringActions.setFilters(array));
            dispatch(filteringActions.setFilterActive(0));
            dispatch(filteringActions.setIsFiltering(true));
        }
        // } else {
        //     dispatch(modalActions.setNote("Filter is not selected!"));
        //     showModalHandler('refNoteModal');
        // }
    };


    // Filter Only Selected button click
    const onlySelectedHandler = (eTarget: EventTarget & HTMLInputElement) => {
        if (eTarget.checked && selectedData.length === 0 && !isOnlySelected) {
            dispatch(filteringActions.setIsOnlySelected(false));
            dispatch(modalActions.setNote("Data is not selected!"));
            showModalHandler('refNoteModal');
        }
        else {
            dispatch(filteringActions.setIsOnlySelected(!isOnlySelected));
            if (eTarget.checked) {
                let newarray: Covids[] = [];
                selectedData.map((item) => {
                    newarray = newarray.concat(covids.filter(dataItem => dataItem.id === item));
                    return newarray
                })
                dispatch(dataActions.setCovids(newarray));
            } else {
                if (filterActive) {
                    dispatch(filteringActions.setIsFiltering(true));
                }
                else { dispatch(dataActions.setCovids(covidsWithoutFilter)); }
            }
        }
    };


    // Set input field in filters array
    const setItem = (filterField: keyof ItemsFilters, index: string, fieldType: string, eTargetValue?: string) => {
        let newarray = filtersCopy.map((item) => {
            if (item.id === index) {
                return {
                    ...item, [filterField]:
                        fieldType === "year" ? setYear(item[filterField] as string, eTargetValue as string)
                            : (fieldType === "month" ? setMonth(item[filterField] as string, eTargetValue as string)
                                : (fieldType === "day" ? setDay(item[filterField] as string, eTargetValue as string)
                                    : (fieldType === "select" || fieldType === "input" ? eTargetValue?.toString()
                                        : (fieldType === "delete" ? ""
                                            : null)
                                    )
                                )
                            )
                };
            } else { return item; }

        });
        dispatch(filteringActions.setFiltersCopy(newarray));
    };


    // Set filter type: input, select, dateselect and notequal switch in filters array
    const itemListType = (listtype: string, value: string | boolean, index: string) => {
        let newarray = filtersCopy.map((item) => {
            if (item.id === index) {
                return { ...item, [listtype]: value };
            } else {
                return item;
            }
        });
        dispatch(filteringActions.setFiltersCopy(newarray));
    };

    const debounce = (isMin: boolean, index: number, delay: number, timeoutInstance: React.MutableRefObject<NodeJS.Timeout | null>, eTarget?: EventTarget & HTMLInputElement | HTMLSelectElement,) => {
        if (timeoutInstance.current) clearTimeout(timeoutInstance.current);
        const timeout = setTimeout(() => {
            if (eTarget) {
                setItem(isMin ? 'min' : 'max', index.toString(), eTarget.name, eTarget.value);
            } else setItem(isMin ? 'min' : 'max', index.toString(), 'delete');

        }, delay);
        timeoutInstance.current = timeout;
        return () => {
            if (timeoutInstance.current) clearTimeout(timeoutInstance.current);
            timeoutInstance.current = null;
        }
    }


    interface Value {
        year: string;
        month: string;
        day: string;
        select: string;
        input: string;
    }

    const changeValue = (
        valueMin: Value[],
        valueMax: Value[],
        setValueMin: React.Dispatch<SetStateAction<Value[]>>,
        setValueMax: React.Dispatch<SetStateAction<Value[]>>,
        timeoutInstance: React.MutableRefObject<NodeJS.Timeout | null>,
        eTarget: EventTarget & HTMLInputElement | HTMLSelectElement,
        index: number,
        isMin: boolean,
    ) => {
        if (isMin) {
            let array = [...valueMin];
            if (index !== 0) {
                array = valueMin.map((value, i) => i === index ? { ...value, [eTarget.name]: eTarget.value } : value);
            } else
                switch (eTarget.name) {
                    case 'select':
                        array = valueMin.map((value, i) => i === index ? { ...value, 'year': getYear(eTarget.value), 'month': getMonth(eTarget.value), 'day': getDay(eTarget.value), 'select': eTarget.value, 'input': eTarget.value } : value);
                        break;
                    case 'input':
                        array = valueMin.map((value, i) => i === index ? { ...value, 'year': getYear(eTarget.value), 'month': getMonth(eTarget.value), 'day': getDay(eTarget.value), 'select': eTarget.value, 'input': eTarget.value } : value);
                        break;
                    case 'year':
                        array = valueMin.map((value, i) => i === index ? { ...value, 'year': eTarget.value, 'input': setYear(value.input, eTarget.value), 'select': setYear(value.input, eTarget.value) } : value);
                        break;
                    case 'month':
                        array = valueMin.map((value, i) => i === index ? { ...value, 'month': eTarget.value, 'input': setMonth(value.input, eTarget.value), 'select': setMonth(value.input, eTarget.value) } : value);
                        break;
                    case 'day':
                        array = valueMin.map((value, i) => i === index ? { ...value, 'day': eTarget.value, 'input': setDay(value.input, eTarget.value), 'select': setDay(value.input, eTarget.value) } : value);
                        break;
                    default: break;
                };
            setValueMin(array);
        } else {
            let array = [...valueMax];
            if (index !== 0) {
                array = valueMax.map((value, i) => i === index ? { ...value, [eTarget.name]: eTarget.value } : value);
            } else
                switch (eTarget.name) {
                    case 'select':
                        array = valueMax.map((value, i) => i === index ? { ...value, 'year': getYear(eTarget.value), 'month': getMonth(eTarget.value), 'day': getDay(eTarget.value), 'select': eTarget.value, 'input': eTarget.value } : value);
                        break;
                    case 'input':
                        array = valueMax.map((value, i) => i === index ? { ...value, 'year': getYear(eTarget.value), 'month': getMonth(eTarget.value), 'day': getDay(eTarget.value), 'select': eTarget.value, 'input': eTarget.value } : value);
                        break;
                    case 'year':
                        array = valueMax.map((value, i) => i === index ? { ...value, 'year': eTarget.value, 'input': setYear(value.input, eTarget.value), 'select': setYear(value.input, eTarget.value) } : value);
                        break;
                    case 'month':
                        array = valueMax.map((value, i) => i === index ? { ...value, 'month': eTarget.value, 'input': setMonth(value.input, eTarget.value), 'select': setMonth(value.input, eTarget.value) } : value);
                        break;
                    case 'day':
                        array = valueMax.map((value, i) => i === index ? { ...value, 'day': eTarget.value, 'input': setDay(value.input, eTarget.value), 'select': setDay(value.input, eTarget.value) } : value);
                        break;
                    default: break;
                };
            setValueMax(array);
        };
        debounce(isMin, index + 1, 700, timeoutInstance, eTarget);
    };


    const deleteValue = (
        valueMin: Value[],
        valueMax: Value[],
        basicValue: Value,
        setValueMin: React.Dispatch<SetStateAction<Value[]>>,
        setValueMax: React.Dispatch<SetStateAction<Value[]>>,
        timeoutInstance: React.MutableRefObject<NodeJS.Timeout | null>,
        index: number,
        both: boolean,
        isMin?: boolean) => {
        if (both) {
            const arrayMin = valueMin.map((value, i) => i === index ? basicValue : value);
            setValueMin(arrayMin);
            const arrayMax = valueMax.map((value, i) => i === index ? basicValue : value);
            setValueMax(arrayMax);
        } else {
            if (isMin) {
                const arrayMin = valueMin.map((value, i) => i === index ? basicValue : value);
                setValueMin(arrayMin);
                debounce(true, index + 1, 700, timeoutInstance);
            } else {
                const arrayMax = valueMax.map((value, i) => i === index ? basicValue : value);
                setValueMax(arrayMax);
                debounce(false, index + 1, 700, timeoutInstance);
            }
        };
    };

    const deleteValues = (
        setValueMin: React.Dispatch<SetStateAction<Value[]>>,
        setValueMax: React.Dispatch<SetStateAction<Value[]>>,
        basicValue: Value,
    ) => {
        setValueMin(Array(8).fill(basicValue));
        setValueMax(Array(8).fill(basicValue));
    };


    return { deleteFiltersCopy, submitFiltersHandler, deleteAllFiltersHandler, onlySelectedHandler, setItem, itemListType, changeValue, deleteValue, deleteValues, debounce };
};

