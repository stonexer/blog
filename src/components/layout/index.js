import { Link } from 'gatsby';
import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader';
import React from 'react';

import * as styles from './index.module.css';

deckDeckGoHighlightElement();

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div>
        {this.renderHeader()}
        <main>{children}</main>
        <footer></footer>
      </div>
    );
  }

  renderHeader() {
    const { avatar, root } = this.props;

    return (
      <header className={`${styles.pageHeader} ${root ? styles.root : ''}`}>
        <div className={styles.navBar}>
          <h1>
            {avatar}
            <Link to={root ? `/` : `/blog`}>
              <span className={styles.gt}>{'> '}</span>
              <span>
                ST<span className={styles.one}>one</span>X
              </span>
              <span className={styles.underline}>{'_'}</span>
            </Link>
          </h1>
          <div>
            <a
              href="https://github.com/stonexer"
              target="_blank"
              rel="noreferrer"
            >
              <svg className={'github'}>
                <path
                  d="M16 4.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C8.422 22.07 7.633 21.7 7.633 21.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C24.565 26.092 28 21.592 28 16.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                  fill-rule="nonzero"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/TianxinShi"
              target="_blank"
              rel="noreferrer"
            >
              <svg className={'twitter'}>
                <path
                  d="M27.954 8.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482c-4.09-.193-7.715-2.157-10.141-5.126a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"
                  fill="currentColor"
                  fill-rule="nonzero"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>
    );
  }
}

export default Layout;
