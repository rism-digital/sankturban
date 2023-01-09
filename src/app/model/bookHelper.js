'use strict';

import KbTagged from '../../../dataset/st_urban-dom.html';

const setCurrentPageByEvent = (e, setCurrentPageURI, setCurrentScrollingDivaPageURI, setCurrentActiveImageId) => {
    const id = e.currentTarget.id;

    setActiveImageButton(id, setCurrentActiveImageId);

    const URI = `https://iiif.rism.digital/image/dlib/${DIVA_BASE_MANIFEST_NAME}/pyr_${id}.tif`;

    setCurrentPageURI(URI);
    setCurrentScrollingDivaPageURI(URI);
}

export const highlightSearchTerm = (searchTerm) => {
    if (/\S/.test(searchTerm)) {

        var specials = new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g');
        return KbTagged.replace(/\s\s+/g, ' ').replace(new RegExp(`(${searchTerm.replace(specials, '\\$&')})`, 'gi'), '<span style="background: yellow">$1</span>');
    }

    return KbTagged;
};

export const anchorClickHandler = (id) => {
    const element = document.getElementById(id);

    if (element) {
        element.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });

        document.getElementById('scroller').scrollLeft = 0;
    }
};

export const setActiveImageButton = (id, setCurrentActiveImageId) => {
    Array.from(document.getElementsByClassName('image')).forEach(e => e.classList.remove('active'))
    const element = document.getElementById(id);

    setCurrentActiveImageId(id);

    element && element.classList.add('active');
}


export const initEventHandlers = (setCurrentPageURI, setCurrentScrollingDivaPageURI, setCurrentActiveImageId) => {
    // init image zoom
    const imgs = document.getElementsByClassName('image');
    Array.from(imgs).forEach(img => img.addEventListener('click', (e) => setCurrentPageByEvent(e, setCurrentPageURI, setCurrentScrollingDivaPageURI, setCurrentActiveImageId), false));

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('noteFloatingContent')) {
            return;
        }

        Array.from(document.getElementsByClassName('noteFloatingContent')).forEach(e => e.remove());
    })

    const notes = document.getElementsByClassName('notelink');
    Array.from(notes).forEach(note => note.addEventListener('click', e => {
        e.preventDefault();

        let target = e.target;

        if (e.target.tagName.toLowerCase() !== 'a') {
            target = e.target.parentNode;
        }

        const targetId = target.getAttribute('data-note_id');
        const targetNote = document.getElementById(targetId.slice(1))

        if (targetNote) {
            const scrollerContent = document.getElementById('scroller-content')
            const wrapper = target.parentNode;
            wrapper.style = 'position: relative';

            const floatingNote = document.createElement('div');
            floatingNote.classList.add('noteFloatingContent')
            const b = document.createElement('b');
            b.append('Note: ')
            floatingNote.appendChild(b);
            floatingNote.append(targetNote.querySelector('.noteBody').innerHTML);
            floatingNote.style = `left: ${scrollerContent.offsetLeft - wrapper.offsetLeft + 23}px; width: ${scrollerContent.clientWidth - 50}px`;

            setTimeout(() => wrapper.appendChild(floatingNote), 1)
        }
    }));

};


export const getIdFromIndex = index => index.replace(`https://iiif.rism.digital/image/dlib/${DIVA_BASE_MANIFEST_NAME}/pyr_`, '').slice(0, -4)

export const generateLetterMatrix = () => {
    return Array.from(document.querySelectorAll('h2')).map(e => ({
        id: e.parentNode.parentNode.id,
        height: e.parentNode.parentNode.clientHeight,
        descriptionHeight: e.parentNode.clientHeight,
        offsetTop: e.parentNode.parentNode.offsetTop,
        imagesIdList: [...e.parentNode.parentNode.querySelectorAll('.image')].map(i => i.id),
        imagesOffsetTop: [...e.parentNode.parentNode.querySelectorAll('.image')].map(i => ({
            id: i.id,
            offsetTop: i.offsetTop
        })),
        firstImageId: e.parentNode.parentNode.querySelector('.image').id,
        value: e.parentNode.parentNode.id,
        label: e.innerHTML
    }))
}