import { useState, useEffect } from 'react';
import categoryService from '@services/categoryService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminCreateCategoryPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const categoryToEdit = state?.category;

  const [category, setCategory] = useState({
    name: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoryToEdit) {
      setCategory({ name: categoryToEdit.name });
    }
  }, [categoryToEdit]);

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      toast.success('Categoria criada com sucesso!', { icon: '✅' });
      queryClient.invalidateQueries(['categories']);
      navigate('/admin/categories');
    },
    onError: (error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`, { icon: '❌' });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...fields }) => categoryService.updateCategory(id, fields),
    onSuccess: () => {
      toast.success('Categoria atualizada com sucesso!', { icon: '✅' });
      queryClient.invalidateQueries(['categories']);
      navigate('/admin/categories');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar categoria: ${error.message}`, { icon: '❌' });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!category.name.trim()) newErrors.name = 'O nome é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (categoryToEdit) {
        await updateCategoryMutation.mutateAsync({ id: categoryToEdit.id, ...category });
      } else {
        await createCategoryMutation.mutateAsync(category);
      }
    } catch (err) {
      toast.error(`Erro ao salvar: ${err.message}`, { icon: '❌' });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header text-bg-light">
            <h2 className="mb-0">{categoryToEdit ? 'Alterar Categoria' : 'Nova Categoria'}</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nome da Categoria</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  name="name"
                  value={category.name}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-success me-2"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span> Salvando...</>
                  ) : 'Salvar Categoria'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/categories')}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCategoryPage;