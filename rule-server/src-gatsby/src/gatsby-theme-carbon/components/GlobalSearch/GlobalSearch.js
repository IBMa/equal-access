// https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html/#ex1
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/role-has-required-aria-props */

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { Close20, Search20 } from '@carbon/icons-react';
import { throttle as _throttle } from 'lodash';
import { navigate } from 'gatsby';
import cx from 'classnames';
import NavContext from 'gatsby-theme-carbon/src/util/context/NavContext';
import { useOnClickOutside } from 'gatsby-theme-carbon/src/util/hooks';

import {
  container,
  input,
  label,
  searchButton,
  searchButtonClose,
  inputWrapper,
  inputFocusWithin,
  hidden,
  inactive,
} from './GlobalSearch.module.scss';

import Menu, { MenuContext } from './Menu';

const MAX_RESULT_LIST_SIZE = 8;

const search = _throttle(queryString => {
  if (window.__LUNR__) {
    const lunrIndex = window.__LUNR__.en;
    const searchResults = lunrIndex.index
      .search(`${queryString}*`)
      .slice(0, MAX_RESULT_LIST_SIZE);
    return searchResults.map(({ ref }) => lunrIndex.store[ref]);
  }
}, 150);

// TODO pass magnifying ref for escape/close? keep focus within outline for input,
const GlobalSearchInput = () => {
  const optionsRef = useRef([]);
  const [focusedItem, setFocusedItem] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const openButtonRef = useRef(null);
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const {
    toggleNavState,
    searchIsOpen,
    isManagingFocus,
    setIsManagingFocus,
  } = useContext(NavContext);

  const clearAndClose = useCallback(() => {
    setQuery('');
    toggleNavState('searchIsOpen', 'close');
    if (openButtonRef.current && isManagingFocus) {
      openButtonRef.current.focus();
    }
  }, [isManagingFocus, toggleNavState]);

  const value = useMemo(
    () => ({ optionsRef, focusedItem, setFocusedItem, clearAndClose }),
    [clearAndClose, focusedItem]
  );

  useEffect(() => {
    if (inputRef.current && searchIsOpen) {
      inputRef.current.focus();
      setInputIsFocused(true);
    }
  }, [searchIsOpen]);

  useOnClickOutside(containerRef, () => {
    toggleNavState('searchIsOpen', 'close');
    setQuery('');
  });

  useEffect(() => {
    if (query) {
      const searchResults = search(query) || [];
      setResults(searchResults);
    } else {
      setResults([]);
    }
    return () => {
      setResults([]);
    };
  }, [query]);

  const onKeyDown = e => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setIsManagingFocus(true);
        setFocusedItem((focusedItem + 1) % results.length);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setIsManagingFocus(true);
        if (focusedItem - 1 < 0) {
          setFocusedItem(results.length - 1);
        } else {
          setFocusedItem(focusedItem - 1);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        if (query === '') {
          clearAndClose();
        } else {
          setQuery('');
          setIsManagingFocus(true);
          inputRef.current.focus();
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (results[focusedItem]) {
          navigate(results[focusedItem].path);
        }
        break;
      }
      default:
    }
  };

  return (
    <MenuContext.Provider value={value}>
      <div
        ref={containerRef}
        className={cx(container, {
          [hidden]: !searchIsOpen,
          [inputFocusWithin]: inputIsFocused,
        })}
        role="search"
        aria-label="Search menu"
      >
        <label htmlFor="search-input" id="search-label" className={label}>
          Search
        </label>
        <div
          className={inputWrapper}
          aria-owns="search-menu"
          aria-expanded={searchIsOpen}
          aria-label="Search menu"
          aria-haspopup="listbox" 
          role="listbox" 
        >
          <button
            tabIndex={searchIsOpen ? '-1' : '0'}
            className={cx(searchButton, {
              [inactive]: searchIsOpen,
            })}
            ref={openButtonRef}
            type="button"
            aria-label="Open search"
            onClick={() => {
              toggleNavState('searchIsOpen', 'open');
              toggleNavState('switcherIsOpen', 'close');
            }}
          >
            <Search20 description="Open search" />
          </button>
          <input
            autoComplete="off"
            tabIndex={searchIsOpen ? '0' : '-1'}
            onBlur={() => setInputIsFocused(false)}
            onFocus={() => setInputIsFocused(true)}
            ref={inputRef}
            type="text"
            aria-autocomplete="list"
            aria-controls="search-menu"
            aria-activedescendant={`menu-item-${focusedItem}`}
            className={cx(input, {
              [hidden]: !searchIsOpen,
            })}
            id="search-input"
            placeholder="Search"
            value={query}
            onKeyDown={onKeyDown}
            onChange={evt => setQuery(evt.target.value)}
          />
          <button
            tabIndex={searchIsOpen ? '0' : '-1'}
            className={cx(searchButton, searchButtonClose, {
              [hidden]: !searchIsOpen,
            })}
            type="button"
            aria-label="Clear search"
            onClick={clearAndClose}
          >
            <Close20 description="Clear search" />
          </button>
        </div>
        <Menu onKeyDown={onKeyDown} results={results} />
      </div>
    </MenuContext.Provider>
  );
};

export default GlobalSearchInput;
