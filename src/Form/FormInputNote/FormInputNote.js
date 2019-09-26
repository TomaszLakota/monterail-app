import React from 'react';
import './FormInputNote.css';

const FormInputNote = ({text, textSecondary}) => {
    return (
        <div className="input-note">
            {text}
            {textSecondary && <div className="input-note__extraText">{textSecondary}</div>}
        </div>
    );
};

export default FormInputNote;
