import React, { useContext } from 'react';
import { useStateWithSession } from '../service/serviceStorage';

import { Link } from 'react-router-dom';

import Template from '../components/template/Template.jsx';

import CustomContext from '../context/customContext';

import Input from '../components/form/Input.jsx';
import FlexWrapper from '../components/template/components/FlexWrapper.jsx';

import { PrimaryButton, SecondaryButton } from '../components/template/components/Buttons.jsx';

import { t } from '../i18n';


const getHighlightedText = (text, highlight) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span> {parts.map((part, i) =>
        <span key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { background: 'yellow' } : {}}>
            {part}
        </span>)
    } </span>;
};

const JsonSearch = () => {

    const [highlightTerm, setHighlightTerm] = useStateWithSession('', 'highlightTerm', 'CustomState');
    const [scrollTop, setScrollTop] = useStateWithSession(0, 'searchScrollTop', 'CustomState');

    const { searchTerm, setSearchTerm, searchResults, performSearch, loadingSearch, resetSearch } = useContext(CustomContext);

    const reset = (e) => {
        e && e.preventDefault()
        resetSearch();
        setHighlightTerm('');
    }

    return (
        <Template
            scrollTop={scrollTop}
            onScrollHandler={setScrollTop}
            withWrapper>

            <form style={{ marginTop: '.5em', marginBottom: '2em' }} onSubmit={(e) => { e.preventDefault(); performSearch(searchTerm); setHighlightTerm(searchTerm); }}>
                <FlexWrapper>
                    <Input
                        style={{ width: '100%' }}
                        className="input__search"
                        placeholder={t('search.form.search_placeholder')}
                        value={searchTerm}
                        onChangeHandler={setSearchTerm}
                        focusOnLoad
                    />
                    <PrimaryButton type="submit" disabled={!/\S/.test(searchTerm) || loadingSearch}>{t(`search.form.${loadingSearch ? 'loading' : 'submit'}`)}</PrimaryButton>
                    <SecondaryButton style={{ marginLeft: '2px', background: '#ccc' }} disabled={!/\S/.test(searchTerm) || loadingSearch} onClick={reset}>{t(`search.form.reset`)}</SecondaryButton>
                </FlexWrapper>
            </form>
            {
                <div style={{ marginBottom: '3em' }}>
                    {
                        Object.keys(searchResults).length ? (
                            <h5>{t('search.nav.count', { count: Object.keys(searchResults).length || 0 })} </h5>
                        ) : (
                            <h5>{t('search.noResults')}</h5>
                        )
                    }
                </div>
            }
            {
                loadingSearch
                    ?
                    <FlexWrapper justifyContent="center" alignItems="center" style={{ flexDirection: 'column', height: '70vh' }}>
                        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                        <h4>{t('search.form.loading')} </h4>
                    </FlexWrapper>
                    : searchResults.length > 0 ? (
                        <div>
                            <FlexWrapper style={{ paddingBottom: '.5em', fontStyle: 'italic', borderBottom: '2px solid #efefef', marginBottom: '2em' }}>
                                <div style={{ width: '100px', paddingRight: '1em' }}>{t('search.head.letter')}</div>
                                <div style={{ width: 'calc(100% - 200px)' }}>{t('search.head.transcription')}</div>
                                <div style={{ textAlign: 'right', width: '100px' }}>{t('search.head.action')}</div>
                            </FlexWrapper>
                            {searchResults.map((result, key) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2em', paddingBottom: '2em', borderBottom: '1px solid #efefef' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: 'calc(100% - 100px)' }}>
                                        <div style={{ width: '100px', paddingRight: '1em' }}>
                                            <b>Nr. {result.letter_count}</b>
                                        </div>
                                        <div style={{ width: 'calc(100% - 100px)' }}>
                                            {getHighlightedText(result.transcription, highlightTerm)}
                                        </div>
                                    </div>
                                    <Link to={`/book#${result.ref}`}>{t('search.actions.go')}</Link>
                                </div>
                            ))}
                        </div>
                    ) : null
            }
        </Template>
    );
};

export default JsonSearch;