import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Categoria from '../../models/Categoria';
import { updateEstadoEliminadoC, getArbolCategorias } from '../../services/FuncionesCategoriaApi';
import { ModalCategoria } from './ModalCategoria';
import { Button } from 'react-bootstrap';
import { UsuarioCliente } from '../../models/Usuario';
import { RolName } from '../../models/RolName';

export function GrillaCategoria() {
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [eliminados, setEliminados] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [jsonUsuario] = useState<any>(localStorage.getItem('usuario'));
    const usuarioLogueado: UsuarioCliente = JSON.parse(jsonUsuario) as UsuarioCliente;

    const getListadoCategorias = async () => {
        const datos: Categoria[] = await getArbolCategorias();
        setCategorias(datos);
    };

    const handleOpen = async () => {
        setEditing(true)
        setShowCategoriaModal(true)
    }

    const handleClose = () => {
        setShowCategoriaModal(false);
        setEditing(false);
        setCategoriaSeleccionada(null);
    };

    const cambiarEstadoCategoria = async (idCategoria: number) => {
        await updateEstadoEliminadoC(idCategoria);
        getListadoCategorias();
    }

    useEffect(() => {
        getListadoCategorias();
    }, []);

    // const rendersCategorias = (categorias: Categoria[]): JSX.Element[] => {
    //     return categorias
    //         .filter(categoria => categoria.eliminado == eliminados) // Filtrar categorías no eliminadas
    //         .map((categoria: Categoria) => (
    //             <React.Fragment key={categoria.id}>
    //                 <tr>
    //                     <td>{categoria.codigo} {categoria.denominacion}</td>
    //                     {usuarioLogueado?.rol?.rolName === RolName.ADMIN && (
    //                         <td>
    //                             <Button variant="outline-warning" style={{ maxHeight: "40px", marginRight: '10px' }}
    //                                 onClick={() => { setCategoriaSeleccionada(categoria); handleOpen(); }}>Modificar</Button>
    //                             {
    //                                 eliminados
    //                                     ?
    //                                     <Button variant="outline-info" style={{ maxHeight: "40px" }}
    //                                         onClick={() => cambiarEstadoCategoria(categoria.id)}>Restaurar</Button>
    //                                     :
    //                                     <Button variant="outline-danger" style={{ maxHeight: "40px" }}
    //                                         onClick={() => cambiarEstadoCategoria(categoria.id)}>Eliminar</Button>
    //                             }
    //                         </td>
    //                     )}
    //                 </tr>
    //                 {rendersCategorias(categoria.subCategorias)}
    //             </React.Fragment>
    //         ));
    // };

    const renderCategorias = (categorias: Categoria[]): JSX.Element[] => {
        return categorias.flatMap((categoria: Categoria) => {
            const subCategoriasEliminadas = categoria.subCategorias.filter(subCat => subCat.eliminado);
            const subCategoriasNoEliminadas = categoria.subCategorias.filter(subCat => !subCat.eliminado);

            const mostrarCategoria = (!eliminados && !categoria.eliminado) || (eliminados && categoria.eliminado);

            return mostrarCategoria ? (
                <React.Fragment key={categoria.id}>
                    <tr>
                        <td>{categoria.codigo} {categoria.denominacion}</td>
                        {usuarioLogueado?.rol?.rolName === RolName.ADMIN && (
                            <td>
                                <Button variant="outline-warning" style={{ maxHeight: "40px", marginRight: '10px' }}
                                    onClick={() => { setCategoriaSeleccionada(categoria); handleOpen(); }}>Modificar</Button>
                                {eliminados
                                    ? <Button variant="outline-info" style={{ maxHeight: "40px" }}
                                        onClick={() => cambiarEstadoCategoria(categoria.id)}>Restaurar</Button>
                                    : <Button variant="outline-danger" style={{ maxHeight: "40px" }}
                                        onClick={() => cambiarEstadoCategoria(categoria.id)}>Eliminar</Button>
                                }
                            </td>
                        )}
                    </tr>
                    {renderCategorias(subCategoriasNoEliminadas)}
                    {eliminados && renderCategorias(subCategoriasEliminadas)}
                </React.Fragment>
            ) : (eliminados && subCategoriasEliminadas.length > 0 ? (
                renderCategorias(subCategoriasEliminadas)
            ) : []);
        });
    };


    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'top', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
                <h1 style={{ marginTop: '20px', color: "whitesmoke", backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '15px 15px' }}>Categorias</h1>
                {
                    (usuarioLogueado && usuarioLogueado.rol && usuarioLogueado.rol.rolName == RolName.ADMIN) &&
                    <Button size="lg" style={{ margin: 20, backgroundColor: '#EE7F46', border: '#EE7F46' }} onClick={() => { setCategoriaSeleccionada(null); handleOpen(); }}>
                        Crear Categoria
                    </Button>
                }
                <ModalCategoria
                    handleClose={handleClose}
                    showModal={showCategoriaModal}
                    editing={editing}
                    categoriaSeleccionada={categoriaSeleccionada}
                />
                <br />
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Denominacion</th>
                            {/* <th>Categoria Padre</th> */}
                            {
                                (usuarioLogueado && usuarioLogueado.rol && usuarioLogueado.rol.rolName == RolName.ADMIN) &&
                                <th style={{ minWidth: "220px" }}>Opciones</th>
                            }

                        </tr>
                    </thead>
                    <tbody>
                        {renderCategorias(categorias)}
                    </tbody>
                </Table>

                <div style={{ width: '100%', display: "flex", justifyContent: 'flex-end' }}>
                    <Button size="lg" style={{ margin: 10, backgroundColor: '#478372', border: '#478372' }} onClick={() => { setEliminados(!eliminados); }}>
                        {eliminados ? "Ver Actuales" : "Ver Eliminados"}
                    </Button>
                </div>
            </div>
        </>
    );
}