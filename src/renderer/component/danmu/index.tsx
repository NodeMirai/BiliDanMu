import React from 'react';

export interface IDanMu {
    name: string;
    msg: string;
}

function DanMu(props: Readonly<IDanMu>) {
    const { name, msg } = props;

    return (
        <div>
            <label htmlFor="">{name}</label>
            <span>{msg}</span>
        </div>
    )
}

export default DanMu;