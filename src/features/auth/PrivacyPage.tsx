import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/signup">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng ký
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Chính sách bảo mật</CardTitle>
            <p className="text-muted-foreground">Cập nhật lần cuối: September 2025</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Cam kết bảo mật</h2>
                <p>
                  Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                  Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Thông tin chúng tôi thu thập</h2>
                <p><strong>Thông tin cá nhân:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Họ tên</li>
                  <li>Địa chỉ email</li>
                  <li>Mật khẩu (được mã hóa)</li>
                  <li>Thông tin hồ sơ (nếu bạn cung cấp)</li>
                </ul>
                
                <p><strong>Dữ liệu sử dụng:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Từ vựng bạn nhập</li>
                  <li>Đoạn văn được tạo</li>
                  <li>Lịch sử học tập</li>
                  <li>Cài đặt ứng dụng</li>
                  <li>Thống kê sử dụng (ẩn danh)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Cách chúng tôi sử dụng thông tin</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cung cấp và cải thiện dịch vụ</li>
                  <li>Cá nhân hóa trải nghiệm học tập</li>
                  <li>Gửi thông báo quan trọng về tài khoản</li>
                  <li>Phân tích để cải thiện ứng dụng</li>
                  <li>Ngăn chặn gian lận và lạm dụng</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Chia sẻ thông tin với bên thứ ba</h2>
                <p>
                  Chúng tôi <strong>KHÔNG</strong> bán, thuê hoặc chia sẻ thông tin cá nhân của bạn 
                  với bên thứ ba cho mục đích thương mại.
                </p>
                <p className="mt-3"><strong>Ngoại lệ:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Khi có yêu cầu pháp lý hợp lệ</li>
                  <li>Để bảo vệ quyền lợi hợp pháp của chúng tôi</li>
                  <li>Với sự đồng ý rõ ràng của bạn</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Bảo mật dữ liệu</h2>
                <p><strong>Biện pháp kỹ thuật:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
                  <li>Mã hóa dữ liệu tại nơi lưu trữ</li>
                  <li>Hệ thống xác thực đa lớp</li>
                  <li>Giám sát bảo mật 24/7</li>
                </ul>
                
                <p><strong>Biện pháp quản lý:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Đào tạo bảo mật cho nhân viên</li>
                  <li>Kiểm soát truy cập nghiêm ngặt</li>
                  <li>Sao lưu dữ liệu thường xuyên</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Quyền của bạn</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Truy cập:</strong> Xem thông tin cá nhân chúng tôi lưu trữ</li>
                  <li><strong>Sửa đổi:</strong> Cập nhật hoặc chỉnh sửa thông tin cá nhân</li>
                  <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu</li>
                  <li><strong>Xuất dữ liệu:</strong> Tải xuống dữ liệu cá nhân</li>
                  <li><strong>Phản đối:</strong> Từ chối một số hoạt động xử lý dữ liệu</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookie và công nghệ theo dõi</h2>
                <p>
                  Chúng tôi sử dụng cookie để:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ghi nhớ đăng nhập của bạn</li>
                  <li>Lưu cài đặt ứng dụng</li>
                  <li>Phân tích cách sử dụng ứng dụng</li>
                  <li>Cải thiện hiệu suất</li>
                </ul>
                <p className="mt-3">
                  Bạn có thể tắt cookie trong trình duyệt, nhưng một số tính năng có thể không hoạt động.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Lưu trữ dữ liệu</h2>
                <p>
                  Dữ liệu của bạn được lưu trữ an toàn trên server được bảo mật tại Việt Nam. 
                  Chúng tôi chỉ lưu trữ dữ liệu trong thời gian cần thiết để cung cấp dịch vụ.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Trẻ em dưới 13 tuổi</h2>
                <p>
                  Ứng dụng của chúng tôi không dành cho trẻ em dưới 13 tuổi. 
                  Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Thay đổi chính sách</h2>
                <p>
                  Chúng tôi có thể cập nhật chính sách bảo mật này. 
                  Các thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trong ứng dụng.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Liên hệ</h2>
                <p>
                  Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
                  <br />
                  Email: privacy@englishlearning.com
                  <br />
                  Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                  <br />
                  Điện thoại: 1900-xxxx
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
