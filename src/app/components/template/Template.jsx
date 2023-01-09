import React, { useContext } from 'react';

import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';

import AnalysisContext from '../../context/analysisContext';

import { useDidMount } from '../../hooks/useDidMount';


import '../../../index.scss';

import './Template.scss';

const Template = props => {

    const contentClassNames = ['template-content'];
    const { isContextBarVisible } = useContext(AnalysisContext);

    const didMount = useDidMount();

    const withWrapper = props.withWrapper !== undefined && props.withWrapper !== false;

    if (!props.hiddenContextBar && isContextBarVisible) {
        contentClassNames.push('template-content__with-contextBar');
    }

    if (props.scrollTop) {
        document.documentElement.scrollTop = props.scrollTop;
    }

    const onScrollHandler = () => {
        props.onScrollHandler && props.onScrollHandler(document.documentElement.scrollTop)
    }

    if (props.onScrollHandler && !didMount) {
        document.addEventListener('scroll', onScrollHandler, true);
    }

    return (
        <div className="template-root">
            <Navbar />
            <Sidebar />
            <div className={contentClassNames.join(' ')}>
                {withWrapper ? <div className="template-content-wrapper">{props.children}</div> : props.children}
            </div>
        </div >
    );

};

export default Template;