import React, { useContext, useEffect } from 'react';
import { useStateWithSession } from '../service/serviceStorage';

import { Link } from 'react-router-dom';

import Template from '../components/template/Template.jsx';

import CurstomContext from '../context/customContext';

import Select from '../components/form/Select.jsx';
import FlexWrapper from '../components/template/components/FlexWrapper.jsx';
import Collapsible from '../components/template/components/Collapsible.jsx';

import { PrimaryButton } from '../components/template/components/Buttons.jsx';
import { useDidMount } from '../hooks/useDidMount';

import { t } from '../i18n';
import { renderFacetLabel } from '../model/INDEXES';

const indexes = () => [
    { value: 'composers', label: renderFacetLabel('composer_ss') },
    { value: 'people', label: renderFacetLabel('people_s') },
    { value: 'places', label: renderFacetLabel('place_s') },
    { value: 'works', label: renderFacetLabel('work_s') },
];

const JsonBrowse = () => {

    const { performBrowse, browseResults, loadingBrowse } = useContext(CurstomContext);

    const [selectedIndex, setSelectedIndex] = useStateWithSession('', 'selectedIndex', 'CustomState');

    const [selectedKeys, setSelectedKeys] = useStateWithSession([], 'selectedKeys', 'CustomState');
    const [scrollTop, setScrollTop] = useStateWithSession(0, 'browseScrollTop', 'CustomState');

    const didMount = useDidMount();

    useEffect(() => {
        if (selectedIndex !== '' && browseResults.length == 0) {
            performBrowse(selectedIndex);
        }
    }, [didMount])

    const selectChangeHandler = value => {
        const testValue = /\S/.test(value);
        testValue && setSelectedIndex(value);
    };

    const onToggleKeyHandler = (collapsed, key) => {
        if (collapsed) {
            setSelectedKeys(selectedKeys.filter(e => e != key))
        } else {
            setSelectedKeys(selectedKeys.concat([key]))
        }
    }

    const onSubmitHandler = (e) => {
        e.preventDefault();
        performBrowse(selectedIndex);
        setSelectedKeys([]);
    }

    return (
        <Template
            scrollTop={scrollTop}
            onScrollHandler={setScrollTop}
            withWrapper>
            <form style={{ marginTop: '.5em', marginBottom: '2em' }} onSubmit={onSubmitHandler}>
                <FlexWrapper>
                    <Select
                        value={selectedIndex}
                        placeholder={t('browse.form.select_placeholder')}
                        onChangeHandler={selectChangeHandler}
                        options={indexes()}
                    />
                    <PrimaryButton disabled={loadingBrowse} type="submit">{t(`browse.form.${loadingBrowse ? 'loading' : 'submit'}`)}</PrimaryButton>
                </FlexWrapper>
            </form>
            {
                loadingBrowse
                    ? <FlexWrapper justifyContent="center" alignItems="center" style={{ flexDirection: 'column', height: '70vh' }}>
                        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                        <h4>{t('browse.form.loading')}</h4>
                    </FlexWrapper>
                    : browseResults && browseResults.map((e, key) => (

                        <Collapsible
                            onClickHandler={collapsed => onToggleKeyHandler(collapsed, key)}
                            key={key}
                            isCollapsed={selectedKeys.includes(key)}
                            header={(<h3 className="collapsible-header-caption"
                                style={{ borderBottom: '1px solid #e8e8e8', display: 'block', width: '100%', paddingBottom: '.5em' }}>
                                {e.name}
                                <small style={{float: 'right', fontStyle: 'normal'}}>
                                    { 
                                        e.bio_anchor && (
                                            <Link to={{
                                                pathname: '/page/biography',
                                                hash: e.bio_anchor
                                            }}>Biographie</Link>
                                        ) 
                                    }
                                </small>
                            </h3>)}>
                            <ul className="jsonBrowseUl">
                                {e.group && Array.isArray(e.group) && e.group.map((linked, key) => (

                                    <li key={key}>{linked.label} <Link to={`/book#${linked.target}`}>{t('search.actions.go')}</Link></li>

                                ))}
                            </ul>
                        </Collapsible>
                    ))
            }
        </Template>
    );
};

export default JsonBrowse;