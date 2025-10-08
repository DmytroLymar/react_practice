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

export const ProductTable = ({
  products,
  sortField,
  sortOrder,
  onSortField,
}) => {
  const columns = [
    { title: 'ID', field: 'productId' },
    { title: 'Product', field: 'productName' },
    { title: 'Category', field: 'categoryTitle' },
    { title: 'User', field: 'userName' },
  ];

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
          {columns.map(c => {
            const isSelected = sortField === c.field;
            const isAsc = sortOrder === 'asc';

            return (
              <th key={c.title}>
                <span className="is-flex is-flex-wrap-nowrap">
                  {c.title}
                  <a href="#/" onClick={() => onSortField(c.field)}>
                    <span className="icon">
                      <i
                        data-cy="SortIcon"
                        className={cn('fas', {
                          'fa-sort': !isSelected,
                          'fa-sort-up': isSelected && isAsc,
                          'fa-sort-down': isSelected && !isAsc,
                        })}
                      />
                    </span>
                  </a>
                </span>
              </th>
            );
          })}
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
  categories,
  selectedCategories,
  onCategorySelect,
}) => {
  const isAllUsers = selectedUserId === null;
  const isAllCategories = selectedCategories.length === 0;

  return (
    <div className="block">
      <nav className="panel">
        <p className="panel-heading">Filters</p>

        <p className="panel-tabs has-text-weight-bold">
          <a
            data-cy="FilterAllUsers"
            href="#/"
            className={cn({ 'is-active': isAllUsers })}
            onClick={() => {
              if (!isAllUsers) {
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
              {search !== '' && (
                <button
                  data-cy="ClearButton"
                  type="button"
                  className="delete"
                  onClick={() => onSearchChange('')}
                />
              )}
            </span>
          </p>
        </div>

        <div className="panel-block is-flex-wrap-wrap">
          <a
            href="#/"
            data-cy="AllCategories"
            className={cn('button is-success mr-6', {
              'is-outlined': !isAllCategories,
            })}
            onClick={() => onCategorySelect(null)}
          >
            All
          </a>

          {categories.map(c => {
            const isSelected = selectedCategories.includes(c.id);

            return (
              <a
                key={c.id}
                data-cy="Category"
                className={cn('button mr-2 my-1', { 'is-info': isSelected })}
                href="#/"
                onClick={() => onCategorySelect(c.id)}
              >
                {c.title}
              </a>
            );
          })}
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
  { sortField, sortOrder },
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

  if (selectedCategories.length > 0) {
    prepared = prepared.filter(p => selectedCategories.includes(p.category.id));
  }

  if (sortField !== null) {
    prepared.sort((p1, p2) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      let sort;

      switch (sortField) {
        case 'productId':
          sort = p1.id - p2.id;
          break;
        case 'productName':
          sort = p1.name.localeCompare(p2.name);
          break;
        case 'categoryTitle':
          sort = p1.category.title.localeCompare(p2.category.title);
          break;
        case 'userName':
          sort = p1.user.name.localeCompare(p2.user.name);
          break;
        default:
          sort = 0;
      }

      return sort * dir;
    });
  }

  return prepared;
};

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

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

  const onCategorySelect = categoryId => {
    if (categoryId === null) {
      setSelectedCategories([]);

      return;
    }

    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId],
    );
  };

  const onSortField = field => {
    if (field !== sortField) {
      setSortField(field);
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortField(null);
      setSortOrder('asc');
    }
  };

  const preparedProducts = prepareProducts(
    buildedProducts,
    { selectedUserId, search, selectedCategories },
    { sortField, sortOrder },
  );

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
          categories={categoriesFromServer}
          selectedCategories={selectedCategories}
          onCategorySelect={onCategorySelect}
        />
        <div className="box table-container">
          <ProductTable
            products={preparedProducts}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortField={onSortField}
          />
        </div>
      </div>
    </div>
  );
};
