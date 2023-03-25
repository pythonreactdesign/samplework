import { Fragment, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import PortalReactDOM from 'react-dom';
import { useReduxSelector } from '../../../store/ReduxTypes';
import { useModalThunks } from '../../../logics/datalistLogics/thunks/ModalThunks';
import { useDataThunks } from '../../../logics/datalistLogics/thunks/DataThunks';

const portalElement = document.getElementById('modals')!;


export const AddEditModal = () => {
    const { hideModalHandler } = useModalThunks();
    const { debounce, createHandler, updateHandler } = useDataThunks();
    const id = useReduxSelector(state => state.data.id);
    const date = useReduxSelector(state => state.data.date);
    const time = useReduxSelector(state => state.data.time);
    const infected = useReduxSelector(state => state.data.infected);
    const activeInfected = useReduxSelector(state => state.data.activeInfected);
    const deceased = useReduxSelector(state => state.data.deceased);
    const recovered = useReduxSelector(state => state.data.recovered);
    const quarantined = useReduxSelector(state => state.data.quarantined);
    const tested = useReduxSelector(state => state.data.tested);
    const sourceWeb = useReduxSelector(state => state.data.sourceWeb);
    const isAdd = useReduxSelector(state => state.modal.isAdd);
    const isModalEffect = useReduxSelector(state => state.effect.isModalEffect);
    const [value, setValue] = useState({
        date: date,
        time: time,
        infected: infected,
        activeInfected: activeInfected,
        deceased: deceased,
        recovered: recovered,
        quarantined: quarantined,
        tested: tested,
        sourceWeb: sourceWeb,
    });
    const timeoutInstance = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (id) {
            const newValue = {
                date: date,
                time: time,
                infected: infected,
                activeInfected: activeInfected,
                deceased: deceased,
                recovered: recovered,
                quarantined: quarantined,
                tested: tested,
                sourceWeb: sourceWeb,
            }
            setValue(newValue);
        }
    }, [activeInfected, date, deceased, id, infected, quarantined, recovered, sourceWeb, tested, time]);


    const changeField = (value: any, eTarget: EventTarget & HTMLInputElement, isNumber: boolean) => {
        if (isNumber) {
            setValue({ ...value, [eTarget.name]: parseInt(eTarget.value) })
        } else setValue({ ...value, [eTarget.name]: eTarget.value })
        debounce(eTarget, 700, timeoutInstance);
    };

    return (
        <Fragment>
            {id && PortalReactDOM.createPortal(
                <div className="modal fade-color" id="refAddEditModal" tabIndex={-1}> {/* ref={refAddEditModal} */}
                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className={isModalEffect ? 'modal-content modal-content-color'
                            : 'modal-content modal-content-notanimated'}>

                            <div className="modal-header">
                                <h5 className="modal-title">{isAdd ? 'Add Data' : 'Edit Data'}</h5>
                                <button type="button" className="btn-close btn-outline-custom btn-modal"
                                    onClick={() => hideModalHandler('refAddEditModal')}>
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="d-flex flex-row bd-highlight mb-3">
                                    <div className="p-1 w-100 bd-highlight">

                                        {/* input field "id" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Id</span>
                                            <input type="text" disabled={true} className="form-control"
                                                value={id} name="id" />
                                        </div>

                                        {/* input field "date" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Date</span>
                                            <input type="date" className="form-control"
                                                value={moment(value.date).format('YYYY-MM-DD')} name="date"
                                                onChange={(e) => changeField(value, e.target, false)} />
                                        </div>

                                        {/* input field "time" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Time</span>
                                            <input type="time" className="form-control"
                                                value={value.time} name="time"
                                                onChange={(e) => changeField(value, e.target, false)} />
                                        </div>

                                        {/* input field "infected" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Infected</span>
                                            <input type="number" className="form-control"
                                                value={value.infected} name="infected"
                                                onChange={(e) => changeField(value, e.target, true)} />
                                            {/* onChange={(e) => changeFieldHandler(e.target)} /> */}
                                        </div>

                                        {/* input field "activeInfected" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">ActiveInfected</span>
                                            <input type="number" className="form-control"
                                                value={value.activeInfected} name="activeInfected"
                                                onChange={(e) => changeField(value, e.target, true)} />
                                        </div>

                                        {/* input field "deceased" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Deceased</span>
                                            <input type="number" className="form-control"
                                                value={value.deceased} name="deceased"
                                                onChange={(e) => changeField(value, e.target, true)} />
                                        </div>

                                        {/* input field "recovered" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Recovered</span>
                                            <input type="number" className="form-control"
                                                value={value.recovered} name="recovered"
                                                onChange={(e) => changeField(value, e.target, true)} />
                                        </div>

                                        {/* input field "quarantined" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Quarantined</span>
                                            <input type="number" className="form-control"
                                                value={value.quarantined} name="quarantined"
                                                onChange={(e) => changeField(value, e.target, true)} />
                                        </div>

                                        {/* input field "tested" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Tested</span>
                                            <input type="number" className="form-control"
                                                value={value.tested} name="tested"
                                                onChange={(e) => changeField(value, e.target, true)} />
                                        </div>

                                        {/* input field "sourceWeb" in Modal */}
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">SourceWeb</span>
                                            <input type="text" maxLength={100} className="form-control"
                                                value={value.sourceWeb} name="sourceWeb"
                                                onChange={(e) => changeField(value, e.target, false)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Create/Update button in Add/Edit Modal */}
                                <button type="button" className="btn btnStyle btn-light btn-outline-custom float-start"
                                    onClick={() => { isAdd ? createHandler() : updateHandler() }}>
                                    {isAdd ? <span>Create</span> : <span>Update</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                , portalElement)}
        </Fragment>
    );
}
