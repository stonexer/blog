import React from 'react';
import { Link, graphql } from 'gatsby';

import Layout from '../../components/layout';
import SEO from '../../components/seo';

import * as styles from './index.module.css';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;

    const posts = data.allMarkdownRemark.edges;

    return (
      <Layout location={this.props.location} root>
        <SEO title="所有文章" />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug;

          return (
            <article className={styles.post} key={node.fields.slug}>
              <aside>
                <small>{node.frontmatter.date}</small>
              </aside>
              <content>
                <header>
                  <h3 className={styles.postTitle}>
                    <Link to={node.fields.slug}>{title}</Link>
                  </h3>
                </header>
                <section className={styles.postDescription}>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </section>
              </content>
            </article>
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY 年 MM 月 DD 日")
            title
            description
          }
        }
      }
    }
  }
`;
