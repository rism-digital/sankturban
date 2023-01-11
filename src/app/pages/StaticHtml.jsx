import React from 'react';
import { useEffect } from 'react';

import { useParams } from 'react-router-dom';

import Template from '../components/template/Template.jsx';
import MarkdownRenderer from '../components/wrappers/MarkdownRenderer.jsx';
import { useDidMount } from '../hooks/useDidMount.js';

const StaticHtmlPage = () => {
    const { filename } = useParams();

    const didMount = useDidMount();

    // test hash and scroll to referenced element..
    useEffect(() => {
        if (didMount) {
            const hash = decodeURI(window.location.hash)
            const element = document.getElementById(hash.replace('#', ''))
            element && element.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
        }
    }, [didMount]);

    return (
        <Template withWrapper>
            <div className="markdown">
                <MarkdownRenderer filename={filename} />
            </div>
        </Template>
    );

};

export default StaticHtmlPage;