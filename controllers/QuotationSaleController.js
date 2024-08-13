const ResponseManager = require("../middleware/ResponseManager");
const {Business,Bank,Customer,Quotation_sale,Quotation_sale_detail} = require('../model/quotationModel'); // call model
const {Employee,Position,Salary_pay,Department,} = require("../model/employeeModel"); // call model
const { cloudinary } = require("../utils/cloudinary");
const { Op } = require('sequelize'); // Import Op from sequelize

class QuotationSaleController {

    static async getBusiness(req, res) {
        try {

            Business.hasMany(Bank, { foreignKey: 'bank_id' });

            const business = await Business.findAll({
                include: [
                  {
                    model: Bank,
                  },
                ]
            })
      
            return ResponseManager.SuccessResponse(req, res, 200, business);
          } catch (err) {
            return ResponseManager.CatchResponse(req, res, err.message);
          }
    }

    static async getCustomer(req, res) {
        try {

            const customer = await Customer.findAll();
            
            return ResponseManager.SuccessResponse(req, res, 200, customer);
          } catch (err) {
            return ResponseManager.CatchResponse(req, res, err.message);
          }
    }
    static async addCustomer(req, res) {
      try {   
        const addCustomer = await Customer.findOne({
            where: {
                cus_name: req.body.cus_name,
              },
        })         
            if(addCustomer){
                return ResponseManager.SuccessResponse(req,res,400,"Customer already exists") 
            }else{
                const insert_cate = await Customer.create({
                  cus_name:req.body.cus_name,  
                  cus_address:req.body.cus_address,  
                  cus_tel:req.body.cus_tel, 
                  cus_email:req.body.cus_email, 
                  cus_tax:req.body.cus_tax, 
                  cus_purchase:req.body.cus_purchase, 
                })
                console.log(req.body)
                return ResponseManager.SuccessResponse(req,res,200,(insert_cate))   
            }   
         
    }catch (err) {
        return ResponseManager.CatchResponse(req, res, err.message)
    }
  }

  static async editCustomer(req, res) {
    try {   
      const editemp = await Customer.findOne({
          where: {
            cus_id: req.params.id,
            },
      })       
      if(editemp){
          const existingUser = await Customer.findOne({
              where: {
                cus_name: req.body.cus_name,
                  cus_id: { [Op.ne]: req.params.id } // ตรวจสอบสินค้าที่ไม่ใช่สินค้าปัจจุบัน
              },
          });
  
          if (existingUser) {
              await ResponseManager.ErrorResponse(req, res, 400, "Customer already exists");
              return;
          }
          await Customer.update(
          {
              cus_name: req.body.cus_name,
              cus_address:req.body.cus_address,  
              cus_tel:req.body.cus_tel, 
              cus_email:req.body.cus_email, 
              cus_tax:req.body.cus_tax, 
              cus_purchase:req.body.cus_purchase, 
          },
          {
              where: {
                  cus_id: req.params.id,
              },
          }               
      )
      return ResponseManager.SuccessResponse(req,res,200,"Customer Updated") 
  }             
  }catch (err) {
      return ResponseManager.CatchResponse(req, res, err.message)
  }
}
static async deleteCustomer(req, res) {
  //delete product
  try {
    const deleteproduct = await Customer.findOne({
      where: {
        cus_id: req.params.id,
      },
    });
    if (deleteproduct) {
      await Customer.destroy({
        where: {
          cus_id: req.params.id,
        },
      });
      return ResponseManager.SuccessResponse(req, res, 200, "Customer Deleted");
    } else {
      return ResponseManager.ErrorResponse(req, res, 400, "No Customer found");
    }
  } catch (err) {
    return ResponseManager.CatchResponse(req, res, err.message);
  }
}

    static async addBusiness(req, res) {
        try {
    
          const checkBusiness = await Business.findOne({
            where: {
                bus_id: 1,
                // bus_name: req.body.bus_name,
            },
          });
          if (!checkBusiness) {

            const allowedMimeTypes = ['image/jpeg', 'image/png'];

            if (req.file && !allowedMimeTypes.includes(req.file.mimetype)) {
                return ResponseManager.ErrorResponse(req, res, 400, "Only JPEG and PNG image files are allowed");
            }

            if (req.file && req.file.size > 5 * 1024 * 1024) {
              res.status(400).json({ error: "File size exceeds 5 MB limit" });
            } 
              const result = await cloudinary.uploader.upload(req.file.path);
              
              const createbank = await Bank.create({
                bank_name:req.body.bank_name,
                bank_account:req.body.bank_account,
                bank_number: req.body.bank_number,
              });
              if(createbank) {
                await Business.create({
                  // productID: req.body.productID,
                  bus_name: req.body.bus_name,
                  bus_address: req.body.bus_address,
                  bus_website: req.body.bus_website,
                  bus_tel: req.body.bus_tel,
                  bus_tax: req.body.bus_tax,
                  bus_logo: result.secure_url,
                  bank_id: createbank.bank_id
                });
              }    
              return ResponseManager.SuccessResponse(req, res, 200, 'Success');
            

          } else {
            let productUpdateData = {
              bus_name: req.body.bus_name,
              bus_address: req.body.bus_address,
              bus_website: req.body.bus_website,
              bus_tax: req.body.bus_tax,
              bus_tel: req.body.bus_tel,
              bank_name: req.body.bank_name,
              bank_account: req.body.bank_account,
              bank_number: req.body.bank_number,
            };

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path);
                productUpdateData.bus_logo = result.secure_url; // Save Cloudinary image path
            }

            await Business.update(
                productUpdateData,
                {
                    where: {
                      bus_id: 1,
                    },
                }
            );
            await Bank.update(
              productUpdateData,
              {
                  where: {
                    bank_id: 1,
                  },
              }
            );
            return ResponseManager.SuccessResponse(req, res, 200, 'Success');
          }
        } catch (err) {
          return ResponseManager.CatchResponse(req, res, err.message);
        }

    }

    static async addQuotationSale(req, res) {
        try {
            const addCustomer = await Customer.findOne({
                where: {
                    cus_email: req.body.cus_email,
                },
              });
              if (addCustomer) {

                const sale_chk = await Quotation_sale.findOne({
                    where: {
                        sale_number: req.body.sale_number,
                    },
                  });

                if(sale_chk){
                  return ResponseManager.ErrorResponse( req,res,400,"Quotation already exists");
                }else{

                const insert_Quo = await Quotation_sale.create({
                            sale_number:req.body.sale_number,
                            sale_date:req.body.sale_date,
                            credit_date_number:req.body.credit_date_number,
                            credit_expired_date: req.body.credit_expired_date,
                            sale_totalprice: req.body.sale_totalprice,
                            bus_id: req.body.bus_id,
                            cus_id: req.body.cus_id,
                            employeeID: req.body.employeeID,
                          });

                          const products = req.body.products;
                          for (let i = 0; i < products.length; i++) {
                            products[i].sale_id = insert_Quo.sale_id
                          }
                          console.log(insert_Quo.sale_id)

                          // ใช้ Sequelize's bulkCreate เพื่อบันทึกข้อมูลทั้งหมดในกรณีที่มีข้อผิดพลาด
                        await Quotation_sale_detail.bulkCreate(products);

                        return ResponseManager.SuccessResponse(req, res, 200, 'Success');
                }
                          
              } else {

                const sale_chk = await Quotation_sale.findOne({
                    where: {
                        sale_number: req.body.sale_number,
                    },
                  });

                if(sale_chk){
                  return ResponseManager.ErrorResponse( req,res,400,"Quotation already exists");
                }else{

                const insert_Customer = await Customer.create({
                    cus_name:req.body.cus_name,
                    cus_address:req.body.cus_address,
                    cus_tel:req.body.cus_tel,
                    cus_email: req.body.cus_email,
                    cus_tax: req.body.cus_tax,
                    cus_purchase: req.body.cus_purchase,
                  });

                  if(insert_Customer){
                    const insert_Quo = await Quotation_sale.create({
                        sale_number:req.body.sale_number,
                        sale_date:req.body.sale_date,
                        credit_date_number:req.body.credit_date_number,
                        credit_expired_date: req.body.credit_expired_date,
                        sale_totalprice: req.body.sale_totalprice,
                        bus_id: req.body.bus_id,
                        cus_id: req.body.cus_id,
                        employeeID: req.body.employeeID,
                      });

                      const products = req.body.products;
                      for (let i = 0; i < products.length; i++) {
                        products[i].sale_id = insert_Quo.sale_id
                      }
                      console.log(insert_Quo.sale_id)


                    // ใช้ Sequelize's bulkCreate เพื่อบันทึกข้อมูลทั้งหมดในกรณีที่มีข้อผิดพลาด
                    await Quotation_sale_detail.bulkCreate(products);

                    return ResponseManager.SuccessResponse(req, res, 200, 'Success');
                    }
                }
              }
          } catch (err) {
            return ResponseManager.CatchResponse(req, res, err.message);
          }
    }
    static async getQuotation(req,res){
      try {

      Quotation_sale.hasMany(Quotation_sale_detail, { foreignKey: "sale_id" });
      Quotation_sale_detail.belongsTo(Quotation_sale, { foreignKey: "sale_id" });

      Quotation_sale.belongsTo(Business, { foreignKey: "bus_id" });
      Business.hasMany(Quotation_sale, { foreignKey: "bus_id" });

      Business.hasMany(Bank, { foreignKey: "bank_id" });
      Bank.belongsTo(Business, { foreignKey: "bank_id" });

      Quotation_sale.belongsTo(Employee, { foreignKey: "employeeID" });
      Employee.hasMany(Quotation_sale, { foreignKey: "employeeID" });

      Quotation_sale.belongsTo(Customer, { foreignKey: "cus_id" });
      Customer.hasMany(Quotation_sale, { foreignKey: "cus_id" });

      let result = [];  
      let quotationslist = [];

      quotationslist = await Quotation_sale.findAll({
          include: [
          { model: Quotation_sale_detail}, 
          { model: Employee}, 
          { model: Customer}, 
          { model: Business , include: [Bank]}, 
          ],
        });
        quotationslist.forEach(log => {
          result.push({
            sale_id: log.sale_id,
            quotation_num: log.sale_number,
            quotation_start_date: log.sale_date,
            credit_date: log.credit_date_number,
            quotation_expired_date: log.credit_expired_date
          });
        });
        
        return ResponseManager.SuccessResponse(req, res, 200, Quotation);
      } catch (err) {
        return ResponseManager.CatchResponse(req, res, err.message);
      }
    }

    static async deleteQuotation(req,res){
 
      try {
        const deleteqto = await Quotation_sale.findOne({
          where: {
            sale_id: req.params.id,
          },
        });
        if (deleteqto) {
          await Quotation_sale.destroy({
            where: {
              sale_id: req.params.id,
            },
          });
          await Quotation_sale_detail.destroy({
            where: {
              sale_id: req.params.id,
            },
          });
          return ResponseManager.SuccessResponse(
            req,
            res,
            200,
            "Quotation Deleted"
          );
        } else {
          return ResponseManager.ErrorResponse(req, res, 400, "No Quotation found");
        }
      
    } catch (err) {
      return ResponseManager.CatchResponse(req, res, err.message);
    }
  }

  static async getBusinessByID(req,res){
  try{

    Business.hasMany(Bank, { foreignKey: 'bank_id' });

    const business = await Business.findOne({
        include: [
          {
            model: Bank,
          },
        ],
        where: {
          bus_id: req.params.id,
        },
    })

    return ResponseManager.SuccessResponse(req, res, 200, business);
  } catch (err) {
    return ResponseManager.CatchResponse(req, res, err.message);
  }

  }

  static async editBusiness(req,res){

    try {
      const editproduct = await Business.findOne({
          where: {
            bus_id: req.params.id,
          },
      });

      if (editproduct) {
          if (req.file && req.file.size > 5 * 1024 * 1024) {
              res.status(400).json({ error: "File size exceeds 5 MB limit" });
          } else {
              let productUpdateData = {
                bus_name: req.body.bus_name,
                bus_address: req.body.bus_address,
                bus_website: req.body.bus_website,
                bus_tax: req.body.bus_tax,
                bus_tel: req.body.bus_tel,
                bank_name: req.body.bank_name,
                bank_account: req.body.bank_account,
                bank_number: req.body.bank_number,
              };

              if (req.file) {
                  const result = await cloudinary.uploader.upload(req.file.path);
                  productUpdateData.bus_logo = result.secure_url; // Save Cloudinary image path
              }

              await Business.update(
                  productUpdateData,
                  {
                      where: {
                        bus_id: req.params.id,
                      },
                  }
              );
              await Bank.update(
                productUpdateData,
                {
                    where: {
                      bank_id: req.params.id,
                    },
                }
            );
          }

          return ResponseManager.SuccessResponse(req, res, 200, "Business Updated");
      } else {
        return ResponseManager.ErrorResponse(req, res, 400, "No Business found");
      }
  } catch (err) {
    return ResponseManager.CatchResponse(req, res, err.message);
  }
    
  }


}

module.exports = QuotationSaleController;