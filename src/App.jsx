/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const buildedProducts = productsFromServer.map(product => {
  const category = categoriesFromServer.find(c => c.id === product.categoryId); // find by product.categoryId
  const user = usersFromServer.find(u => u.id === category.ownerId); // find by category.ownerId

  return { ...product, category, user };
});

export const Product = ({ product }) => {
  const isMen = product.user.sex === 'm';

  return (
    <tr data-cy="Product">
      <td className="has-text-weight-bold" data-cy="ProductId">
        {product.id}
      </td>

      <td data-cy="ProductName">{product.name}</td>
      <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

      <td
        data-cy="ProductUser"
        className={cn({ 'has-text-link': isMen, 'has-text-danger': !isMen })}
      >
        {product.user.name}
      </td>
    </tr>
  );
};

export const ProductTable = ({ products }) => {
  if (products.length === 0) {
    return (
      <p data-cy="NoMatchingMessage">No products matching selected criteria</p>
    );
  }

  return (
    <table
      data-cy="ProductTable"
      className="table is-striped is-narrow is-fullwidth"
    >
      <thead>
        <tr>
          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              ID
              <a href="#/">
                <span className="icon">
                  <i data-cy="SortIcon" className="fas fa-sort" />
                </span>
              </a>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Product
              <a href="#/">
                <span className="icon">
                  <i data-cy="SortIcon" className="fas fa-sort-down" />
                </span>
              </a>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Category
              <a href="#/">
                <span className="icon">
                  <i data-cy="SortIcon" className="fas fa-sort-up" />
                </span>
              </a>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              User
              <a href="#/">
                <span className="icon">
                  <i data-cy="SortIcon" className="fas fa-sort" />
                </span>
              </a>
            </span>
          </th>
        </tr>
      </thead>

      <tbody>
        {products.map(product => (
          <Product key={product.id} product={product} />
        ))}
      </tbody>
    </table>
  );
};

export const Filters = ({
  users,
  selectedUserId,
  onUserSelect,
  search,
  onSearchChange,
  onReset,
}) => {
  const isAll = selectedUserId === null;
  return (
    <div className="block">
      <nav className="panel">
        <p className="panel-heading">Filters</p>

        <p className="panel-tabs has-text-weight-bold">
          <a
            data-cy="FilterAllUsers"
            href="#/"
            className={cn({ 'is-active': isAll })}
            onClick={() => {
              if (!isAll) {
                onUserSelect(null);
              }
            }}
          >
            All
          </a>

          {users.map(user => {
            const isSelected = selectedUserId === user.id;
            return (
              <a
                key={user.id}
                data-cy="FilterUser"
                href="#/"
                className={cn({ 'is-active': isSelected })}
                onClick={() => {
                  if (!isSelected) {
                    onUserSelect(user.id);
                  }
                }}
              >
                {user.name}
              </a>
            );
          })}
        </p>

        <div className="panel-block">
          <p className="control has-icons-left has-icons-right">
            <input
              data-cy="SearchField"
              type="text"
              className="input"
              placeholder="Search"
              value={search}
              onChange={event => onSearchChange(event.target.value)}
            />

            <span className="icon is-left">
              <i className="fas fa-search" aria-hidden="true" />
            </span>

            <span className="icon is-right">
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <button data-cy="ClearButton" type="button" className="delete" />
            </span>
          </p>
        </div>

        <div className="panel-block is-flex-wrap-wrap">
          <a
            href="#/"
            data-cy="AllCategories"
            className="button is-success mr-6 is-outlined"
          >
            All
          </a>

          <a data-cy="Category" className="button mr-2 my-1 is-info" href="#/">
            Category 1
          </a>

          <a data-cy="Category" className="button mr-2 my-1" href="#/">
            Category 2
          </a>

          <a data-cy="Category" className="button mr-2 my-1 is-info" href="#/">
            Category 3
          </a>
          <a data-cy="Category" className="button mr-2 my-1" href="#/">
            Category 4
          </a>
        </div>

        <div className="panel-block">
          <a
            data-cy="ResetAllButton"
            href="#/"
            className="button is-link is-outlined is-fullwidth"
            onClick={onReset}
          >
            Reset all filters
          </a>
        </div>
      </nav>
    </div>
  );
};

const prepareProducts = (
  products,
  { selectedUserId, search, selectedCategories },
) => {
  let prepared = [...products];

  if (selectedUserId !== null) {
    prepared = prepared.filter(p => p.user.id === selectedUserId);
  }

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();
    prepared = prepared.filter(p =>
      p.name.toLowerCase().includes(normalizedSearch),
    );
  }

  return prepared;
};

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const onUserSelect = userId => {
    setSelectedUserId(userId);
  };

  const onSearchChange = input => {
    setSearch(input);
  };

  const onReset = () => {
    setSelectedUserId(null);
    setSearch('');
    setSelectedCategories([]);
  };

  const preparedProducts = prepareProducts(buildedProducts, {
    selectedUserId,
    search,
    selectedCategories,
  });

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>
        <Filters
          users={usersFromServer}
          selectedUserId={selectedUserId}
          onUserSelect={onUserSelect}
          search={search}
          onSearchChange={onSearchChange}
          onReset={onReset}
        />
        <div className="box table-container">
          <ProductTable products={preparedProducts} />
        </div>
      </div>
    </div>
  );
};
