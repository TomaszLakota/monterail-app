import React, {Component} from 'react';
import './FormGroup.css';
import GroupHeader from '../GroupHeader/GroupHeader';

export default class FormGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <section className="form-group">
                <GroupHeader title={this.props.title} />
            </section>
        );
    }
}
