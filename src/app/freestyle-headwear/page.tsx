"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

const defaultConfig = {
  'discount': 5,
  'addlLeadTime': 2,
  'moq': 6,
  'moqPrice': 60
};

const categoryArray = [
  { 'name': 'custom-headwear', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'styles', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'running-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'beanies-knits', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'camo-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'on-field-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'lifestyle-outdoor-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'sideline-coaches-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'trucker-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'visors', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'boonie-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'features', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'flexfit-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'snapback-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'structured-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'unstructured-hats', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'search-display-view-tags', 'tag': 'search-display-view-tags', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'search-display-view-term', 'searchTerm': 'search-display-view-tags', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'fanwear', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'lacrosse', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'baseball', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'basketball', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'soccer', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'football', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'fleece', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'track', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'training', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'softball', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'polo', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': '5-day-turbo', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'volleyball', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'babe-ruth-turbo', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'accessories', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'compression', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'semi-sublimated', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice },
  { 'name': 'default-page', 'discount': defaultConfig.discount, 'addlLeadTime': defaultConfig.addlLeadTime, 'moq': defaultConfig.moq, 'moqPrice': defaultConfig.moqPrice }
];

const categoryShareMapper: { [key: string]: string } = {
  'custom headwear': 'custom-headwear',
  'styles': 'styles',
  'active/lightweight': 'running-hats',
  'beanies': 'beanies-knits',
  'camo': 'camo-hats',
  'on-field': 'on-field-hats',
  'outdoor': 'lifestyle-outdoor-hats',
  'sideline': 'sideline-coaches-hats',
  'truckers / mesh back': 'trucker-hats',
  'visors': 'visors',
  'wide brim / boonie': 'boonie-hats',
  'features': 'features',
  'flexfit': 'flexfit-hats',
  'snapback': 'snapback-hats',
  'structured': 'structured-hats',
  'unstructured': 'unstructured-hats',
  'search-display-view-tags': 'search-display-view-tags',
  'search-display-view-term': 'search-display-view-term',
  'fanwear': 'fanwear',
  'lacrosse': 'lacrosse',
  'baseball': 'baseball',
  'basketball': 'basketball',
  'soccer': 'soccer',
  'football': 'football',
  'fleece': 'fleece',
  'outerwear': 'fleece',
  'track': 'track',
  'training': 'training',
  'softball': 'softball',
  'polos': 'polo',
  'turbo': '5-day-turbo',
  'volleyball': 'volleyball',
  'babe ruth turbo': 'babe-ruth-turbo',
  'masks, gaiters,': 'accessories',
  'compression': 'compression',
  'semi-sublimated': 'semi-sublimated',
  'freestyle sublimation': 'default-page'
};

export default function FreestyleHeadwearPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeDivRef = useRef<HTMLDivElement>(null);
  const [iframeSrc, setIframeSrcState] = useState<string>('https://www.augustasportwear.ca/freestyle-custom-headwear');
  const [showLoader, setShowLoader] = useState(true);
  const [iframeHasSameDomainUrl, setIframeHasSameDomainUrl] = useState(true);
  const [pageUrl, setPageUrl] = useState<string>(typeof window !== 'undefined' ? location.href : '');
  const [pageQuery, setPageQuery] = useState<string | null>(null);
  const [domainUrl, setDomainUrl] = useState<string>(typeof window !== 'undefined' ? document.domain : '');

  const validate = useCallback((queryString: { [key: string]: string } | null, type: string) => {
    return !!(queryString && queryString[type]);
  }, []);

  const getFullUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    if (window.location && window.location.search) {
      if (window.location.search.substring(1)) {
        return window.location.search.substring(1);
      }
    }
    const baseUrl = window.document.baseURI;
    const baseUrlData = baseUrl.split("?");
    if (baseUrlData[1] !== undefined) {
      return baseUrlData[1];
    }
    return "";
  }, []);

  const getCurrentUrlParams = useCallback(() => {
    if (iframeHasSameDomainUrl === false) {
      return pageQuery ? (Object.fromEntries(new URLSearchParams(pageQuery).entries())) : {};
    } else {
      const operator = '&';
      const getUrl = getFullUrl();
      const obj: { [key: string]: string } = {};
      const params = getUrl.split(operator);
      for (let i = 0; i < params.length; ++i) {
        const value = params[i].split('=', 2);
        if (value.length === 1)
          obj[value[0]] = "";
        else
          obj[value[0]] = decodeURIComponent(value[1].replace(/\+/g, " "));
      }
      return obj;
    }
  }, [iframeHasSameDomainUrl, pageQuery, getFullUrl]);

  const checkCategory = useCallback((categoryName: string) => {
    const category = categoryArray.filter((item) => item.name === categoryName);
    return category.length > 0;
  }, []);

  const isCapConfiguratorPage = useCallback(() => {
    const queryString = getCurrentUrlParams();
    return validate(queryString, 'dNumber');
  }, [getCurrentUrlParams, validate]);

  const isConfiguratorPage = useCallback(() => {
    const queryString = getCurrentUrlParams();
    return validate(queryString, 'sNumber');
  }, [getCurrentUrlParams, validate]);

  const generateUrl = useCallback((categoryName: string | null, isCategoryName: boolean) => {
    if (!iframeRef.current) return 'https://www.augustasportwear.ca/freestyle-custom-headwear'; // Default fallback

    let currentIframeUrl = iframeRef.current.src;
    const queryString = getCurrentUrlParams();
    let replaceText = 'freestyle-custom-headwear';
    let effectiveCategoryName = categoryName;

    if (effectiveCategoryName) {
      effectiveCategoryName = categoryShareMapper[effectiveCategoryName.toLowerCase().trim()] || effectiveCategoryName;
      replaceText = 'freestyle-custom-headwear-' + effectiveCategoryName;
      if (isCapConfiguratorPage()) {
        replaceText = 'CapConfigurator';
      } else if (isConfiguratorPage()) {
        replaceText = 'Configurator';
      } else if (!isCategoryName) {
        replaceText = 'SearchDisplayView';
        // categoryName already mapped above
      } else if (!checkCategory(effectiveCategoryName)) {
        effectiveCategoryName = 'custom-headwear';
        replaceText = 'freestyle-custom-headwear';
      }
    } else {
      effectiveCategoryName = 'custom-headwear';
      if (isCapConfiguratorPage()) {
        replaceText = 'CapConfigurator';
      } else if (isConfiguratorPage()) {
        effectiveCategoryName = 'default-page';
        replaceText = 'Configurator';
      }
    }

    const Index = categoryArray.findIndex(x => x.name.toLowerCase().trim() === effectiveCategoryName?.toLowerCase().trim());
    const categoryObj = Index !== -1 ? categoryArray[Index] : {};

    const urlParts = currentIframeUrl.split('?');
    const urlArray = urlParts[0];
    const urlHrefArray = urlArray.split('/');
    const urlHrefReplaceEntity = urlHrefArray[urlHrefArray.length - 1];
    urlParts[0] = urlArray.replace(urlHrefReplaceEntity, replaceText);
    const newUrl = urlParts.join('?');

    const href = new URL(newUrl);
    const categoryObjLength = Object.keys(categoryObj).length;
    if (categoryObjLength) {
      Object.keys(categoryObj).forEach(function (key) {
        href.searchParams.delete(key);
        if (key === 'tag') {
          const value = (queryString as any)['tag'];
          if (value) href.searchParams.set(key, value);
        } else if (key === 'searchTerm') {
          const value = (queryString as any)['searchTerm'];
          if (value) href.searchParams.set(key, value);
        } else {
          href.searchParams.set(key, (categoryObj as any)[key]);
        }
      });
    }

    if (isConfiguratorPage() || isCapConfiguratorPage()) {
      Object.keys(queryString).forEach(function (key) {
        href.searchParams.delete(key);
        href.searchParams.set(key, (queryString as any)[key]);
      });
    }

    return href.toString();
  }, [getCurrentUrlParams, isCapConfiguratorPage, isConfiguratorPage, checkCategory]);

  const getIframeSrc = useCallback(() => {
    const queryString = getCurrentUrlParams();

    if (validate(queryString, 'categoryName')) {
      const categoryName = (queryString as any)['categoryName'];
      return generateUrl((categoryName.toLowerCase()).trim(), true);
    } else if (validate(queryString, 'searchTerm')) {
      const searchTerm = (queryString as any)['searchTerm'];
      return generateUrl('search-display-view-term', false);
    } else if (validate(queryString, 'tag')) {
      const tag = (queryString as any)['tag'];
      return generateUrl('search-display-view-tags', false);
    } else {
      const currentURL = pageUrl;
      const url = currentURL.split("?");
      const urlArray = url[0];
      const urlHrefArray = urlArray.split('/');
      let categoryName: string | null = null;
      urlHrefArray.forEach(function (urlEntity) {
        categoryArray.forEach(function (category) {
          if ((urlEntity.toLowerCase()).trim() === ((category.name).toLowerCase()).trim()) {
            categoryName = ((category.name).toLowerCase()).trim();
          }
        });
      });
      return generateUrl(categoryName, true);
    }
  }, [getCurrentUrlParams, validate, generateUrl, pageUrl]);

  const updateIframeSource = useCallback(() => {
    const newSrc = getIframeSrc();
    if (newSrc) {
      setIframeSrcState(newSrc);
    } else if (iframeRef.current) {
      setIframeSrcState(iframeRef.current.src); // Reload current src
    }
    setTimeout(() => {
      setShowLoader(false);
    }, 1000);
  }, [getIframeSrc]);

  const sendParentHeightToChild = useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const child = iframeRef.current.contentWindow;
      const elemTop = iframeDivRef.current?.offsetTop || 0;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const calcHeight = windowHeight - elemTop;
      child.postMessage("parentHeight:" + calcHeight, '*');
      child.postMessage("parentDomain:" + domainUrl, '*');
    }
  }, [domainUrl]);

  const sendDataToChild = useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const child = iframeRef.current.contentWindow;
      child.postMessage("loadNextPageIframe", '*');
    }
  }, []);

  const isScrolledIntoView = useCallback(() => {
    if (!iframeDivRef.current) return false;
    const elem = iframeDivRef.current;
    const docViewTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const docViewBottom = docViewTop + windowHeight;
    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.offsetHeight;
    return ((elemBottom <= docViewBottom));
  }, []);

  useEffect(() => {
    updateIframeSource();

    const handleScroll = () => {
      if (isScrolledIntoView()) {
        sendDataToChild();
      }
    };

    window.addEventListener('scroll', handleScroll);

    const handleMessage = (e: MessageEvent) => {
      const data = e.data.toString();
      if (typeof e.data === 'object' && e.data.domainUrl) {
        setIframeHasSameDomainUrl(false);
        setPageUrl(e.data.pageUrl);
        setPageQuery(e.data.pageQuery);
        const domain = e.data.domainUrl;
        setDomainUrl(domain.replace(/^https?:\/\//, ''));
        updateIframeSource();
      }
      if (typeof e.data === 'string' && data.indexOf('asgIframeHeight') > -1) {
        const iframeHeight = e.data.split(":");
        if (iframeDivRef.current) {
          iframeDivRef.current.style.height = iframeHeight[1] + 'px';
        }
      }
      if (typeof e.data === 'string' && data.indexOf('reLoadIframe') > -1) {
        updateIframeSource();
      }
      if (typeof e.data === 'string' && data.indexOf('scrollToTop') > -1) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      if (typeof e.data === 'string' && data.indexOf('asgPageName') > -1) {
        const pageName = e.data.split(":");
        if (iframeRef.current) {
          if (pageName[1] === 'capConfigurator') {
            iframeRef.current.setAttribute("scrolling", "yes");
          } else {
            iframeRef.current.setAttribute("scrolling", "no");
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const iframeCurrent = iframeRef.current;
    if (iframeCurrent) {
      iframeCurrent.addEventListener("load", sendParentHeightToChild);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('message', handleMessage);
      if (iframeCurrent) {
        iframeCurrent.removeEventListener("load", sendParentHeightToChild);
      }
    };
  }, [isScrolledIntoView, sendDataToChild, updateIframeSource, sendParentHeightToChild, domainUrl]);

  return (
    <>
      {showLoader && (
        <div id="loaderAlign">
          <div className="loader"></div>
        </div>
      )}
      <div id="iframediv" ref={iframeDivRef} style={{ display: showLoader ? 'none' : 'block', height: '2905px', minHeight: '600px' }}>
        <iframe
          id="myIframe"
          ref={iframeRef}
          scrolling="no"
          height="100%"
          width="100%"
          src={iframeSrc}
          title="Freestyle Custom Headwear"
        ></iframe>
      </div>
    </>
  );
}