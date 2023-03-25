import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import PortalReactDOM from 'react-dom';
import { useReduxSelector } from '../../../store/ReduxTypes';
import { useModalThunks } from '../../../logics/datalistLogics/thunks/ModalThunks';
import { useFilteringThunks } from '../../../logics/datalistLogics/thunks/FilteringThunks';
import { getYear, uniqueList, getMonth, getDay } from '../../../logics/datalistLogics/Logics';



const portalElement = document.getElementById('modals')!;





export const FilteringModal = () => {
    const { hideModalHandler } = useModalThunks();
    const { deleteFiltersCopy, itemListType, deleteAllFiltersHandler, submitFiltersHandler, changeValue, deleteValue, deleteValues } = useFilteringThunks();

    const isModalEffect = useReduxSelector(state => state.effect.isModalEffect);
    const filtersCopy = useReduxSelector(state => state.filtering.filtersCopy);
    const filters = useReduxSelector(state => state.filtering.filters);
    const filterActive = useReduxSelector(state => state.filtering.filterActive);
    const covidsWithoutFilter = useReduxSelector(state => state.data.covidsWithoutFilter);
    const envMonths: string[] = JSON.parse(process.env.REACT_APP_MONTHS as string);
    const envDays: string[] = JSON.parse(process.env.REACT_APP_DAYS as string);

    const basicValue = useMemo(() => { return { year: '', month: '', day: '', select: '', input: '' } }, []);
    const [valueMin, setValueMin] = useState(Array(8).fill(basicValue));
    const [valueMax, setValueMax] = useState(Array(8).fill(basicValue));
    const timeoutInstance = useRef<NodeJS.Timeout | null>(null);
    const [isInit, setIsinit] = useState(true);

    useEffect(() => {
        if (isInit || filterActive === 0) {
            let arrayMin = Array(8).fill(basicValue);
            let arrayMax = Array(8).fill(basicValue);
            filters.forEach((item, index) => {
                if (item.fieldname === 'date') {
                    arrayMin[index] = { year: getYear(item.min), month: getMonth(item.min), day: getDay(item.min), select: item.min, input: item.min };
                    arrayMax[index] = { year: getYear(item.max), month: getMonth(item.max), day: getDay(item.max), select: item.max, input: item.max };
                } else {
                    arrayMin[index] = { select: item.min, input: item.min };
                    arrayMax[index] = { select: item.max, input: item.max };
                }
            });
            setValueMin(arrayMin);
            setValueMax(arrayMax);
            setIsinit(false);
        }
    }, [isInit, filterActive, filters, basicValue]);


    return (
        <Fragment>
            {PortalReactDOM.createPortal(
                <div className="modal fade" id="refModalFiltering" tabIndex={-1} >
                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className={isModalEffect ? 'modal-content modal-content-color'
                            : 'modal-content modal-content-notanimated'}>
                            <div className="modal-header">
                                <h5 className="modal-title">Set Filtering Range</h5>
                                <button type="button" className="btn-close btn-outline-custom btn-modal"
                                    onClick={() => {
                                        setIsinit(true);
                                        deleteFiltersCopy();
                                        hideModalHandler('refModalFiltering');
                                    }}>
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="d-flex flex-row bd-highlight mb-3">
                                    <div className="p-2 w-100 bd-highlight">

                                        {filtersCopy.map((item, index) =>
                                            <div key={item.id}>
                                                <div className="d-flex flex-row">
                                                    <div className="btn-group me-auto">
                                                        {item.type === "date" ?
                                                            <div className="form-check form-check-inline float-start">
                                                                <input className="custom-control-input form-check-input" type="radio" id="dateselect"
                                                                    checked={item.listtype === 'dateselect'} onChange={() => {
                                                                        itemListType("listtype", "dateselect", item.id);
                                                                    }} />
                                                                <label className="custom-control-label" htmlFor="dateselect">Date</label>
                                                            </div>
                                                            : null}

                                                        <div className="form-check form-check-inline float-start">
                                                            <input className="custom-control-input form-check-input" type="radio" id="select"
                                                                checked={item.listtype === 'select'} onChange={() => {
                                                                    itemListType("listtype", "select", item.id);
                                                                }} />
                                                            <label className="custom-control-label" htmlFor="select">Select</label>
                                                        </div>

                                                        <div className="form-check form-check-inline float-start">
                                                            <input className="custom-control-input form-check-input" type="radio" id="input"
                                                                checked={item.listtype === 'input'} onChange={() => {
                                                                    itemListType("listtype", "input", item.id);
                                                                }} />
                                                            <label className="custom-control-label" htmlFor="input">Input</label>
                                                        </div>
                                                    </div>
                                                    <div className="btn-group ms-auto">
                                                        <div className="form-switch form-check float-end">
                                                            <input className="custom-control-input form-check-input" type="checkbox" id="notequal"
                                                                checked={item.notequal} onChange={() => {
                                                                    itemListType("notequal", !item.notequal, item.id);
                                                                }} />
                                                            <label className="custom-control-label" htmlFor="notequal">Not Equal</label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="responsiveSmall-Filter input-group-text mb-1">
                                                    {item.fieldname.charAt(0).toUpperCase() + item.fieldname.slice(1)} Range
                                                </div>

                                                <div className="input-group mb-3">
                                                    <span className="responsiveLarge-Filter input-group-text">
                                                        {item.fieldname.charAt(0).toUpperCase() + item.fieldname.slice(1)} Range
                                                    </span>

                                                    {item.listtype === "dateselect" ?
                                                        <>
                                                            {/* Dateselect min year */}
                                                            <select className="form-control input-sm" name='year' value={valueMin[index].year}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, true);
                                                                }}>

                                                                <option value='' disabled hidden>Year...</option>
                                                                {uniqueList(covidsWithoutFilter, "date", "dateselect").map((year, index) =>
                                                                    <option key={year} value={year as string}>
                                                                        {year}
                                                                    </option>)}
                                                            </select>

                                                            {/* Dateselect min month */}
                                                            <select className="form-control input-sm" name='month' value={valueMin[index].month}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, true);
                                                                }}>

                                                                <option value='' disabled hidden>Month...</option>
                                                                {envMonths.map((month, index) =>
                                                                    <option key={month} value={month}>
                                                                        {month}
                                                                    </option>)}
                                                            </select>

                                                            {/* Dateselect min day */}
                                                            <select className="form-control input-sm" name='day' value={valueMin[index].day}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, true);
                                                                }}>

                                                                <option value='' disabled hidden>Day...</option>
                                                                {envDays.map((day, index) =>
                                                                    <option key={day} value={day}>
                                                                        {day}
                                                                    </option>)}
                                                            </select>
                                                        </>

                                                        : (item.listtype === "select" ?
                                                            // Select min
                                                            <select className="form-select" name='select' value={valueMin[index].select}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, true);
                                                                }}>

                                                                <option value='' disabled hidden>Choose...</option>
                                                                {uniqueList(covidsWithoutFilter, item.fieldname, "select").map((data, index) =>
                                                                    <option key={data} value={data as string}>
                                                                        {data}
                                                                    </option>)}
                                                            </select>

                                                            : (item.listtype === "input" ?
                                                                < input type={item.type} className="form-control" name='input' value={valueMin[index].input}
                                                                    placeholder="Min..."
                                                                    onChange={(e) => {
                                                                        changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, true);
                                                                    }} />
                                                                : null
                                                            )
                                                        )
                                                    }

                                                    {/* Delete filter min button */}
                                                    <button type="button" className="btn btnStyle btn-link btn-sm"
                                                        onClick={() => {
                                                            deleteValue(valueMin, valueMax, basicValue, setValueMin, setValueMax, timeoutInstance, index, false, true);
                                                        }}>
                                                        <span className="bi bi-trash"></span>
                                                    </button>


                                                    {item.listtype === "dateselect" ?
                                                        <>
                                                            {/* Dateselect max year */}
                                                            <select className="form-control input-sm" name='year' value={valueMax[index].year}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, false);
                                                                }}>

                                                                <option value='' disabled hidden>Year...</option>
                                                                {uniqueList(covidsWithoutFilter, "date", "dateselect").map((year, index) =>
                                                                    <option key={index} value={year as string}>
                                                                        {year}
                                                                    </option>)}
                                                            </select>

                                                            {/* Dateselect max month */}
                                                            <select className="form-control input-sm" name='month' value={valueMax[index].month}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, false);
                                                                }}>

                                                                <option value='' disabled hidden>Month...</option>
                                                                {envMonths.map((month, index) =>
                                                                    <option key={index} value={month}>
                                                                        {month}
                                                                    </option>)}
                                                            </select>

                                                            {/* Dateselect max day */}
                                                            <select className="form-control input-sm" name='day' value={valueMax[index].day}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, false);
                                                                }}>

                                                                <option value='' disabled hidden>Day...</option>
                                                                {envDays.map((day, index) =>
                                                                    <option key={index} value={day}>
                                                                        {day}
                                                                    </option>)}
                                                            </select>
                                                        </>

                                                        : (item.listtype === "select" ?
                                                            // Select max
                                                            <select className="form-select" name='select' value={valueMax[index].select}
                                                                onChange={(e) => {
                                                                    changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, false);
                                                                }}>

                                                                <option value='' disabled hidden>Choose...</option>
                                                                {uniqueList(covidsWithoutFilter, item.fieldname, "select").map((data, index) =>
                                                                    <option key={data} value={data as string}>
                                                                        {data}
                                                                    </option>)}
                                                            </select>

                                                            : (item.listtype === "input" ?
                                                                <input type={item.type} className="form-control" name='input' value={valueMax[index].input}
                                                                    placeholder="Max..."
                                                                    onChange={(e) => {
                                                                        changeValue(valueMin, valueMax, setValueMin, setValueMax, timeoutInstance, e.target, index, false);
                                                                    }} />
                                                                : null
                                                            )
                                                        )
                                                    }

                                                    {/* Delete filter max button */}
                                                    <button type="button" className="btn btnStyle btn-link btn-sm"
                                                        onClick={() => {
                                                            deleteValue(valueMin, valueMax, basicValue, setValueMin, setValueMax, timeoutInstance, index, false, false);
                                                        }}>
                                                        <span className="bi bi-trash"></span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="btn-group">
                                            <button type="button" className="btn btnStyle btn-outline-custom btn-sm m-3 rounded"
                                                onClick={() => {
                                                    deleteValues(setValueMin, setValueMax, basicValue);
                                                    deleteAllFiltersHandler(true);
                                                }}>
                                                Delete all filters
                                                <span className="bi bi-trash btn-lg"></span>
                                            </button>

                                            <button type="button" className="btn btnStyle btn-outline-custom btn-sm m-3 rounded"
                                                onClick={() => submitFiltersHandler()}>
                                                Submit Filters
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                , portalElement)}
        </Fragment>
    );
}
