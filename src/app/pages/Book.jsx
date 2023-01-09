import React, { useEffect, useState, useContext } from 'react';

import Template from '../components/template/Template.jsx';
import Diva from '../components/wrappers/Diva.jsx';

import { PrimaryButtonSmall } from '../components/template/components/Buttons.jsx';
import { CrossairIcon } from '../components/template/components/Icons.jsx';
import Select from '../components/form/Select.jsx';
import FlexWrapper from '../components/template/components/FlexWrapper.jsx';

import { useDidMount } from '../hooks/useDidMount';
import CustomContext from '../context/customContext';

import { t } from '../i18n';

import {
    highlightSearchTerm,
    anchorClickHandler,
    setActiveImageButton,
    initEventHandlers,
    getIdFromIndex,
    generateLetterMatrix
} from '../model/bookHelper';

import './Book.scss';

const Book = () => {

    const [currentPageURI, setCurrentPageURI] = useState('');
    const [currentScrollingDivaPageURI, setCurrentScrollingDivaPageURI] = useState('');
    const [currentActiveImageId, setCurrentActiveImageId] = useState();
    const [currentLetterId, setCurrentLetterId] = useState('');
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
    const [pageOptions, setPageOptions] = useState([]);
    const [isMobile, setIsMobile] = useState(window.outerWidth < 1440);
    const [divaVisible, setDivaVisible] = useState(!isMobile);
    const [initialPageURI, setInitialPageURI] = useState();

    const [scrollTop, setScrollTop] = useState(0);

    const [letters, setLetters] = useState([{}]);

    const [isScrollListenerDisabled, setIsScrollListenerDisabled] = useState(false);

    const { searchTerm } = useContext(CustomContext);

    const didMount = useDidMount();

    const setCurrentHashByWindowHash = () => {
        const anchor = window.location.hash.substring(1);

        if (anchor) {
            const letters = generateLetterMatrix();
            const index = letters.findIndex(e => e.id == anchor);

            // console.log(`moving to ${anchor} by window hash`, index);

            setIsScrollListenerDisabled(true);
            setCurrentLetterId(anchor);
            setCurrentLetterIndex(index);
            gotoIndex(anchor, letters)
            setTimeout(() => setIsScrollListenerDisabled(false), 500)
        }

    };

    const onScrollHtmlHandler = (e) => {

        if (e.target.id !== 'scroller' || isScrollListenerDisabled) {
            return;
        }

        const scrollTop = e.target.scrollTop;
        const letters = generateLetterMatrix();

        setScrollTop(scrollTop);

        let current;
        let index;
        for (let k = 0; k < letters.length; k++) {

            if (scrollTop >= letters[k].offsetTop && scrollTop <= letters[k].offsetTop + letters[k].height) {
                current = letters[k];
                index = k;
            }
        }

        if (current) {
            setCurrentLetterId(current.id);
            setCurrentLetterIndex(index);

            const shouldSetCurrentPageURI =
                !current.imagesIdList.includes(getIdFromIndex(currentPageURI))
                && scrollTop >= current.offsetTop
                && scrollTop <= current.offsetTop + current.descriptionHeight

            if (shouldSetCurrentPageURI) {
                const URI = `https://iiif.rism.digital/image/dlib/${DIVA_BASE_MANIFEST_NAME}/pyr_${current.firstImageId}.tif`
                setCurrentPageURI(URI);
                setCurrentScrollingDivaPageURI(URI)
                setActiveImageButton(current.firstImageId, setCurrentActiveImageId)
            }
        }

    };

    const updateLayout = () => {
        setIsMobile(window.outerWidth < 1440);
    };

    if (!didMount) {
        window.addEventListener('hashchange', setCurrentHashByWindowHash, false);
        window.addEventListener('resize', updateLayout, false);
    }

    useEffect(() => {
        if (!didMount) {
            setCurrentHashByWindowHash();
            initEventHandlers(setCurrentPageURI, setCurrentScrollingDivaPageURI, setCurrentActiveImageId);
        }

        setTimeout(() => setLetters(generateLetterMatrix()), 1000);

    }, [didMount]);

    useEffect(() => {
        setDivaVisible(!isMobile);
    }, [isMobile]);


    const generateTitleList = () => letters.map(e => ({ value: e.value, label: e.label }));

    const generateSelectPageOptions = (pageCount) => {
        const options = [];

        for (let k = 0; k < pageCount.length; k++) {
            const label = getIdFromIndex(pageCount[k]).replace('StaLu_', '').replace('_', ' ').replace('_', ' ')
            options.push({ value: pageCount[k], label });
        }

        setPageOptions(options);
    };

    const isCurrentActiveImageButtonVisible = () => {

        let isVisibleInViewport = false;
        let image;

        // search for current image data inside letters matrix
        letters.length > 1 && letters.forEach(letter => {
            if (letter.imagesOffsetTop.some(i => i.id == currentActiveImageId)) {
                image = letter.imagesOffsetTop.find(i => i.id == currentActiveImageId)
            }
        })

        // if an image was found...
        if (image) {
            // ... set browser user current scrolling params...
            const scroller = document.getElementById('scroller') || {}
            const scrollTop = scroller.scrollTop || 0;
            const scrollerHeight = scroller.clientHeight;
            const offsetMargin = 50;

            // ... and check whether current image is visible inside viewport
            if (image.offsetTop >= scrollTop - offsetMargin && image.offsetTop <= scrollTop + scrollerHeight - offsetMargin) {
                isVisibleInViewport = true;
            }
        }

        return isVisibleInViewport;
    };

    const getLetterIdFromImageId = (imageId) => letters.find(letter => letter.imagesIdList.includes(imageId)).id;

    const gotoIndex = (index, overrideLetters = null) => {

        const title = overrideLetters
            ? overrideLetters.find(t => t.id == index)
            : letters.find(t => t.id == index);

        if (title) {
            if (overrideLetters) {
                document.getElementById('scroller').scrollTop = title.offsetTop;
            } else {
                document.getElementById('scroller').scroll({ top: title.offsetTop, left: 0, behavior: 'smooth' });
            }
        }
    }

    const dynamicClassNames = [];

    if (divaVisible) {
        dynamicClassNames.push('__diva-visible');
    }

    if (isMobile) {
        dynamicClassNames.push('__mobile');
    }

    const injectDynamicClassNames = baseClassName => [baseClassName].concat(dynamicClassNames.map(e => `${baseClassName}${e}`)).join(' ');

    return (
        <Template>
            <div className="book-main">
                <div className={injectDynamicClassNames('book-main-left')}>
                    <div id="scroller"
                        onScroll={onScrollHtmlHandler}>
                        <div
                            id="scroller-content"
                            dangerouslySetInnerHTML={{ __html: `<div id="scroller-content">${highlightSearchTerm(searchTerm)}</div>` }}
                        />
                    </div>

                    <a id="divaButton"
                        href="#"
                        onClick={e => { e && e.preventDefault(); setDivaVisible(!divaVisible); }}>
                        {t(`book.nav.${divaVisible ? 'hideDiva' : 'showDiva'}`)}
                    </a>

                    <FlexWrapper justifyContent="center" className="nav-main">
                        <FlexWrapper className="nav-inner">
                            <div className="nav-inner-left">
                                <label>{t('book.nav.labelNav')}</label>
                                <FlexWrapper>
                                    <PrimaryButtonSmall
                                        disabled={currentLetterId === letters[0].id || currentLetterId === ''}
                                        action={() => {
                                            const prevIndex = currentLetterIndex - 1 || 0;
                                            const id = letters[prevIndex].id

                                            setIsScrollListenerDisabled(true);
                                            setCurrentLetterIndex(prevIndex);
                                            setCurrentLetterId(id)
                                            gotoIndex(id)

                                            setTimeout(() => setIsScrollListenerDisabled(false), 500);
                                        }}>
                                        <span dangerouslySetInnerHTML={{ __html: t('book.nav.prev') }} />
                                    </PrimaryButtonSmall>

                                    <PrimaryButtonSmall
                                        style={{ marginLeft: '2px' }}
                                        disabled={currentLetterId === letters[letters.length - 1].id}
                                        action={() => {
                                            const nextIndex = currentLetterIndex + 1;
                                            const id = letters[nextIndex].id

                                            setIsScrollListenerDisabled(true);
                                            setCurrentLetterIndex(nextIndex);
                                            setCurrentLetterId(id)
                                            gotoIndex(id)

                                            setTimeout(() => setIsScrollListenerDisabled(false), 500);
                                        }}>
                                        <span dangerouslySetInnerHTML={{ __html: t('book.nav.next') }} />
                                    </PrimaryButtonSmall>
                                </FlexWrapper>
                            </div>

                            <Select
                                label={t('book.nav.labelCurrentLetter')}
                                style={{ marginLeft: '.5em', marginTop: '-6px' }}
                                inputStyle={{ padding: '.5rem' }}
                                options={generateTitleList()}
                                value={currentLetterId}
                                onChangeHandler={value => {
                                    setIsScrollListenerDisabled(true);
                                    setCurrentLetterId(value);
                                    setCurrentLetterIndex(letters.findIndex(e => e.id == value))
                                    gotoIndex(value)
                                    setTimeout(() => setIsScrollListenerDisabled(false), 1000);
                                }}
                            />


                            <div className="nav-spacer" />

                            <Select
                                label={t('book.nav.labelCurrentImage')}
                                style={{ marginLeft: '1.5em', marginTop: '-6px' }}
                                inputStyle={{ padding: '.5rem' }}
                                options={pageOptions}
                                value={currentScrollingDivaPageURI}
                                onChangeHandler={value => setCurrentPageURI(value)}
                            />

                            <div style={{ marginTop: '.8em', marginLeft: '.3em' }}>
                                <PrimaryButtonSmall
                                    title={t('book.nav.titleSynchButton')}
                                    style={{ padding: '6px 7px 4px 7px', marginTop: '1px' }}
                                    action={() => {
                                        setIsScrollListenerDisabled(true);
                                        const index = getIdFromIndex(currentScrollingDivaPageURI);
                                        anchorClickHandler(index)
                                        setActiveImageButton(index, setCurrentActiveImageId);
                                        const letterId = getLetterIdFromImageId(index);
                                        setCurrentLetterId(letterId);
                                        setTimeout(() => setIsScrollListenerDisabled(false), 1000);

                                    }}
                                    disabled={isCurrentActiveImageButtonVisible()}
                                >
                                    <CrossairIcon width={21} height={21} />
                                </PrimaryButtonSmall>
                            </div>

                        </FlexWrapper>
                    </FlexWrapper>
                </div >

                <div className={injectDynamicClassNames('book-main-right')}>
                    <Diva
                        manifest={`${DIVA_BASE_MANIFEST_NAME}.json`}
                        currentPageURI={currentPageURI}
                        initialPageURI={initialPageURI}
                        onLoad={count => { generateSelectPageOptions(count); }}
                        onScrollHandler={value => {
                            setCurrentScrollingDivaPageURI(value);
                            const index = getIdFromIndex(value);
                            setActiveImageButton(index, setCurrentActiveImageId);
                        }}
                    />
                </div>
            </div>
        </Template>
    );
};

export default Book;