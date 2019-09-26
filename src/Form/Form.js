import React, {Component} from 'react';
import './Form.css';
import categoriesJSON from '../categories';
import employeesJSON from '../employes';
import GroupHeader from './GroupHeader/GroupHeader';
import FormInputNote from './FormInputNote/FormInputNote';
import FormGroup from './FormGroup/FormGroup';

export default class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUserID: 3,
            day_period: 'AM',
            payment: 'free',
            event_fee: null,
            description: '',
            category_id: '',
            coordinator_id: '',
            coordinator_email: '',
            duration: null,
            reward: null,
            time: null,
            valid: {
                coordinator_email: null,
                title: null,
                description: null,
                event_fee: null,
                date: null
            },
            timeoutForEmailValidation: null,
            success: false
        };
    }

    componentDidMount() {
        //here I would normally fetch data, in this case I just grab them from json files I've imported
        this.setState({
            categories: categoriesJSON,
            employees: employeesJSON,
            coordinator_id: this.state.currentUserID
        });
    }

    changeValueInTimeInput(e, radioState) {
        var s = e.target.value;
        var org_s = s;
        s = s.slice(0, 2);
        if (s === '00') {
            org_s = org_s.replace('00', '12');
            document.getElementById(e.target.id).value = org_s;
            this.setState({
                [radioState]: 'AM'
            });
            return;
        }
        if (s > 12) {
            s = s - 12;
            if (s < 10) org_s = org_s.replace(s + 12, '0' + s);
            else org_s = org_s.replace(s + 12, s);
            document.getElementById(e.target.id).value = org_s;
            this.setState({
                [radioState]: 'PM'
            });
            return;
        }
    }

    handleChange = (e) => {
        if (e.target.id === 'time') {
            this.changeValueInTimeInput(e, 'day_period');
        }
        let valid = this.validate(e);
        this.setState({
            [e.target.id]: e.target.value,
            valid: valid
        });
    };

    validate(e) {
        let valid = this.state.valid;
        switch (e.target.id) {
            case 'title': {
                // eslint-disable-next-line eqeqeq
                valid.title = !!e.target.value;
                break;
            }
            case 'description': {
                // eslint-disable-next-line eqeqeq
                valid.description = !!e.target.value;
                valid.description = e.target.value.length > 140 ? false : valid.description;
                break;
            }
            case 'coordinator_email': {
                // eslint-disable-next-line eqeqeq
                if (this.state.timeoutForEmailValidation != null) {
                    clearTimeout(this.state.timeoutForEmailValidation);
                }

                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) || e.target.value === '') {
                    valid.coordinator_email = true;
                } else {
                    var tmout = setTimeout(() => {
                        valid.coordinator_email = false;
                        this.setState({
                            valid: valid
                        });
                    }, 500);
                    this.setState({
                        timeoutForEmailValidation: tmout
                    });
                }
                break;
            }
            case 'date': {
                let date;
                // eslint-disable-next-line eqeqeq
                if (this.state.time != null) {
                    date = new Date(e.target.value + ' ' + this.state.time);
                    if (this.state.day_period === 'PM') {
                        date.setHours(date.getHours() + 12);
                    }
                } else {
                    date = new Date(e.target.value);
                }
                valid.date = date > Date.now();
                break;
            }
            case 'time': {
                let date = new Date(this.state.date + ' ' + e.target.value);
                if (this.state.day_period === 'PM') {
                    date.setHours(date.getHours() + 12);
                }
                if (date > Date.now()) {
                    valid.date = true;
                } else {
                    valid.date = false;
                }
                break;
            }
            case 'payment': {
                valid.event_fee = null;
                break;
            }
            case 'event_fee': {
                !e.target.value || e.target.value <= 0 ? (valid.event_fee = false) : (valid.event_fee = true);
                break;
            }
            default: {
            }
        }
        return valid;
    }

    validateAll() {
        let valid = this.state.valid;
        let allValid = true;
        Object.entries(valid).forEach((key) => {
            switch (key[0]) {
                case 'title': {
                    if (!key[1]) {
                        allValid = false;
                    }
                    break;
                }
                case 'description': {
                    if (!key[1]) {
                        allValid = false;
                    }
                    break;
                }
                case 'coordinator_email': {
                    if (key[1] === false) {
                        allValid = false;
                    }
                    break;
                }
                case 'date': {
                    if (!key[1]) {
                        allValid = false;
                    }
                    break;
                }
                case 'event_fee': {
                    if (key[1] === false) {
                        allValid = false;
                    }
                    break;
                }
                default: {
                    console.log('unexpected value in validateAll() ', key[1]);
                }
            }
        });

        return allValid;
    }

    onSubmit = (event) => {
        event.preventDefault();
        let valid = this.validateAll();
        if (!valid) {
            this.highlightAllRequired();
            return;
        }
        let date = new Date(this.state.date + ' ' + this.state.time);
        if (this.state.day_period === 'PM') {
            date.setHours(date.getHours() + 12);
        }
        let formatedDate = date.toJSON().slice(0, -8);
        let response = {
            title: this.state.title,
            description: this.state.description,
            category_id: this.state.category_id !== '' ? this.state.category_id : null,
            paid_event: this.state.payment === 'paid',
            event_fee: this.state.event_fee,
            reward: this.state.reward,
            date: formatedDate, // returns date with time in GMT
            duration: this.state.duration !== null ? this.state.duration * 3600 : null, // in seconds
            coordinator: {
                email: this.state.coordinator_email !== '' ? this.state.coordinator_email : null,
                id: this.state.coordinator_id
            }
        };
        //console.log(response);
        console.log(JSON.stringify(response));
        this.setState({
            success: true
        });
    };

    highlightAllRequired() {
        let valid = this.state.valid;
        if (valid.title === null) {
            valid.title = false;
        }
        if (valid.description === null) {
            valid.description = false;
        }
        if (valid.date === null || this.state.time == null) {
            valid.date = false;
        }
        if (this.state.payment === 'paid' && valid.event_fee === null) {
            valid.event_fee = false;
        }

        this.setState({
            valid: valid
        });
    }

    render() {
        if (this.state.success) {
            return (
                <div className="App">
                    <div className="form-container capitalize-labels">
                        <form onSubmit={this.onSubmit} noValidate>
                            <div className="form-header">
                                <h2>New event</h2>
                            </div>
                            <div className="form-body">
                                <div className="form-group success">
                                    <h3>Success</h3>
                                    <p>Event has been created.</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }
        return (
            <div className="App">
                <div className="form-container capitalize-labels">
                    <form onSubmit={this.onSubmit} noValidate>
                        <div className="form-header">
                            <h2>New event</h2>
                        </div>
                        <div className="form-body">
                            <FormGroup title="About" />
                            <div className="form-group">
                                <GroupHeader title="About" />
                                <div className="form-element">
                                    <label
                                        htmlFor="title"
                                        className={this.state.valid.title === false ? 'label-invalid' : 'label-valid'}>
                                        title<span>*</span>
                                    </label>
                                    <input
                                        id="title"
                                        placeholder="Make it short and clear"
                                        onChange={this.handleChange}
                                        className={this.state.valid.title === false ? 'input-invalid' : 'input-valid'}
                                    />
                                    {this.state.valid.title === false && (
                                        <div className="speech-bubble">Title cannot be empty</div>
                                    )}
                                </div>
                                <div className="form-element">
                                    <label
                                        htmlFor="description"
                                        className={
                                            this.state.valid.description === false ? 'label-invalid' : 'label-valid'
                                        }>
                                        description<span>*</span>
                                    </label>
                                    <div className="textarea-container">
                                        <textarea
                                            id="description"
                                            placeholder="Write about your event, be creative"
                                            maxLength="140"
                                            onChange={this.handleChange}
                                            className={
                                                this.state.valid.description === false ? 'input-invalid' : 'input-valid'
                                            }
                                        />
                                        {this.state.valid.description === false && (
                                            <div className="speech-bubble textarea">Description cannot be empty</div>
                                        )}
                                        <FormInputNote
                                            text="Max length 140 characters"
                                            textSecondary={this.state.description.length + '/140'}
                                        />
                                    </div>
                                </div>
                                <div className="form-element">
                                    <label htmlFor="category_id">category</label>
                                    <select
                                        id="category_id"
                                        onChange={this.handleChange}
                                        style={{color: this.state.category_id === '' ? '#ccc' : '#666'}}>
                                        <option disable="disabled" hidden>
                                            Select category
                                        </option>
                                        {this.state.categories &&
                                            this.state.categories.map((cat, i) => {
                                                return (
                                                    <option key={i} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                );
                                            })}
                                    </select>
                                    <FormInputNote text="Describes topic and people who should be interested in this event" />
                                </div>
                                <div className="form-element">
                                    <label
                                        htmlFor=""
                                        className={
                                            this.state.valid.event_fee === false ? 'label-invalid' : 'label-valid'
                                        }>
                                        payment
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="payment_free"
                                            id="payment"
                                            value="free"
                                            checked={this.state.payment === 'free'}
                                            onChange={this.handleChange}
                                        />
                                        <span> Free event </span>
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="payment"
                                            id="payment"
                                            value="paid"
                                            checked={this.state.payment === 'paid'}
                                            onChange={this.handleChange}
                                        />
                                        <span>Paid event</span>
                                    </label>
                                    {this.state.payment === 'paid' && (
                                        <React.Fragment>
                                            <input
                                                type="number"
                                                name="event_fee"
                                                id="event_fee"
                                                placeholder="Fee"
                                                min={0}
                                                onChange={this.handleChange}
                                                className={
                                                    this.state.valid.event_fee === false
                                                        ? 'input-invalid'
                                                        : 'input-valid'
                                                }
                                            />
                                            <span>$</span>
                                        </React.Fragment>
                                    )}
                                    {this.state.valid.event_fee === false && (
                                        <div className="speech-bubble textarea">Value must be greater than 0</div>
                                    )}
                                </div>
                                <div className="form-element">
                                    <label htmlFor="reward">reward</label>
                                    <input
                                        type="number"
                                        name="reward"
                                        id="reward"
                                        placeholder="Number"
                                        onChange={this.handleChange}
                                    />
                                    <span> reward points for attendance</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <GroupHeader title="Coordinator" />
                                <div className="form-element">
                                    <label htmlFor="coordinator_id">
                                        responsible<span>*</span>
                                    </label>
                                    <select id="coordinator_id" onChange={this.handleChange}>
                                        <optgroup label="Me">
                                            <option value={this.state.currentUserID}>
                                                {Array.isArray(this.state.employees) &&
                                                    this.state.currentUserID &&
                                                    this.state.employees[this.state.currentUserID].name +
                                                        ' ' +
                                                        this.state.employees[this.state.currentUserID].lastname}
                                            </option>
                                        </optgroup>
                                        <optgroup label="Others">
                                            {this.state.employees &&
                                                this.state.employees.map((el, i) => {
                                                    return el.id !== this.state.currentUserID ? (
                                                        <option key={i} value={el.id}>
                                                            {el.name + ' ' + el.lastname}
                                                        </option>
                                                    ) : null;
                                                })}
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="form-element">
                                    <label
                                        htmlFor="coordinator_email"
                                        className={
                                            this.state.valid.coordinator_email === false
                                                ? 'label-invalid'
                                                : 'label-valid'
                                        }>
                                        email
                                    </label>
                                    <input
                                        type="email"
                                        id="coordinator_email"
                                        placeholder="Email"
                                        onChange={this.handleChange}
                                        className={
                                            this.state.valid.coordinator_email === false
                                                ? 'input-invalid'
                                                : 'input-valid'
                                        }
                                    />
                                    {this.state.valid.coordinator_email === false && (
                                        <div className="speech-bubble textarea">Incorrect email format</div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <GroupHeader title="When" />
                                <div className="form-element">
                                    <label
                                        htmlFor="date"
                                        className={this.state.valid.date === false ? 'label-invalid' : 'label-valid'}>
                                        starts on<span>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        onChange={this.handleChange}
                                        className={this.state.valid.date === false ? 'input-invalid' : 'input-valid'}
                                    />
                                    <span> at </span>
                                    <input
                                        type="time"
                                        id="time"
                                        onChange={this.handleChange}
                                        className={this.state.valid.date === false ? 'input-invalid' : 'input-valid'}
                                    />
                                    <input
                                        type="radio"
                                        name="day_period"
                                        id="day_period"
                                        value="AM"
                                        checked={this.state.day_period === 'AM'}
                                        onChange={this.handleChange}
                                    />
                                    <span> AM </span>
                                    <input
                                        type="radio"
                                        name="day_period"
                                        id="day_period"
                                        value="PM"
                                        checked={this.state.day_period === 'PM'}
                                        onChange={this.handleChange}
                                    />
                                    <span> PM </span>
                                    {this.state.valid.date === false && (
                                        <div className="speech-bubble">A valid date is required</div>
                                    )}
                                </div>
                                <div className="form-element">
                                    <label htmlFor="duration">duration</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        id="duration"
                                        placeholder="Number"
                                        onChange={this.handleChange}
                                    />
                                    <span>hour</span>
                                </div>
                            </div>
                            <div>
                                <button>PUBLISH EVENT</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
