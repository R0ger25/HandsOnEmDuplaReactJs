import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '@services/categoryService';
import Pagination from '@components/Pagination';

const CATEGORIES_PER_PAGE = 4;

const AdminCategoriesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['categories', currentPage],
    queryFn: () => categoryService.getCategoriesByPage(currentPage, CATEGORIES_PER_PAGE),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      toast.success('Categoria excluída com sucesso');
      queryClient.invalidateQueries(['categories']);
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleDelete = (id) => {
    if (window.confirm('Deseja excluir esta categoria?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category) => {
    navigate('/admin/categories/edit/' + category.id, { state: { category } });
  };

  if (isError) {
    return <div className="alert alert-danger mt-4">Erro: {error.message}</div>;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 mb-3">
        <div className="card">
          <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
            <h2 className="mb-0">Categorias</h2>
            <button className="btn btn-success" onClick={() => navigate('/admin/categories/new')}>
              Adicionar Categoria
            </button>
          </div>
          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center my-5">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Nome</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.categories?.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center py-4">
                          Nenhuma categoria cadastrada.
                        </td>
                      </tr>
                    )}
                    {data?.categories?.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => handleEdit(category)}>
                            Alterar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(category.id)}>
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {data?.totalPages > 1 && (
        <>
          <div className="d-flex justify-content-center mb-2">
            <Pagination
              currentPage={currentPage}
              totalPages={data?.totalPages}
              onPageChange={(newPage) => setCurrentPage(newPage)}
            />
          </div>
          <p className="small text-center m-0">
            Mostrando página {currentPage} de {data?.totalPages}
          </p>
        </>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
